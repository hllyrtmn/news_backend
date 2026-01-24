"""
Content Moderation Utilities
- Spam detection
- Profanity filter
- Auto-moderation rules
"""
import re
from django.conf import settings
from django.core.cache import cache


class ProfanityFilter:
    """
    Profanity filter for Turkish and English content
    """

    # Turkish profanity words (censored examples)
    TURKISH_BAD_WORDS = [
        # Add Turkish profanity words here (censored)
        'spam', 'reklam', 'viagra', 'casino', 'bahis',
        # Production'da daha kapsamlı liste kullanılmalı
    ]

    # English profanity words
    ENGLISH_BAD_WORDS = [
        'spam', 'viagra', 'casino', 'porn', 'xxx',
        # Production'da daha kapsamlı liste kullanılmalı
    ]

    # Combine all bad words
    BAD_WORDS = set(TURKISH_BAD_WORDS + ENGLISH_BAD_WORDS)

    @classmethod
    def contains_profanity(cls, text):
        """
        Check if text contains profanity
        Returns: (bool, list of found words)
        """
        if not text:
            return False, []

        text_lower = text.lower()
        found_words = []

        for word in cls.BAD_WORDS:
            # Word boundary regex to avoid false positives
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, text_lower):
                found_words.append(word)

        return len(found_words) > 0, found_words

    @classmethod
    def censor_text(cls, text):
        """
        Replace profanity with asterisks
        """
        if not text:
            return text

        censored_text = text

        for word in cls.BAD_WORDS:
            pattern = r'\b(' + re.escape(word) + r')\b'
            replacement = '*' * len(word)
            censored_text = re.sub(
                pattern,
                replacement,
                censored_text,
                flags=re.IGNORECASE
            )

        return censored_text

    @classmethod
    def profanity_score(cls, text):
        """
        Calculate profanity score (0-100)
        Higher score = more profanity
        """
        if not text:
            return 0

        contains, found_words = cls.contains_profanity(text)

        if not contains:
            return 0

        # Score based on number and frequency of bad words
        word_count = len(text.split())
        if word_count == 0:
            return 0

        score = min(100, (len(found_words) / word_count) * 100 * 10)
        return int(score)


class SpamDetector:
    """
    Spam detection for comments
    """

    @staticmethod
    def check_url_spam(text, max_urls=2):
        """
        Check if text contains too many URLs
        """
        # Find all URLs
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, text)

        return len(urls) > max_urls, len(urls)

    @staticmethod
    def check_repeated_characters(text, max_repeat=5):
        """
        Check for repeated characters (e.g., "heeeeello")
        """
        pattern = r'(.)\1{' + str(max_repeat) + r',}'
        matches = re.findall(pattern, text)

        return len(matches) > 0, matches

    @staticmethod
    def check_all_caps(text, threshold=0.7):
        """
        Check if text is mostly uppercase
        """
        if not text or len(text) < 10:
            return False, 0

        letters = [c for c in text if c.isalpha()]
        if not letters:
            return False, 0

        caps_ratio = sum(1 for c in letters if c.isupper()) / len(letters)

        return caps_ratio > threshold, caps_ratio

    @staticmethod
    def check_duplicate_comment(user, content):
        """
        Check if user recently posted same content
        """
        if not user:
            return False

        # Check cache for recent comments
        cache_key = f'comment_hash_{user.id}_{hash(content)}'
        if cache.get(cache_key):
            return True

        # Set cache for 5 minutes
        cache.set(cache_key, True, 60 * 5)
        return False

    @staticmethod
    def spam_score(text, user=None):
        """
        Calculate spam score (0-100)
        Higher score = more likely spam
        """
        score = 0

        # Check profanity
        profanity_score = ProfanityFilter.profanity_score(text)
        score += profanity_score * 0.3

        # Check URL spam
        has_url_spam, url_count = SpamDetector.check_url_spam(text)
        if has_url_spam:
            score += 40

        # Check repeated characters
        has_repeated, _ = SpamDetector.check_repeated_characters(text)
        if has_repeated:
            score += 15

        # Check all caps
        is_caps, caps_ratio = SpamDetector.check_all_caps(text)
        if is_caps:
            score += 20

        # Check duplicate
        if user and SpamDetector.check_duplicate_comment(user, text):
            score += 50

        return min(100, int(score))


class AutoModerator:
    """
    Automatic moderation based on rules
    """

    # Thresholds
    SPAM_THRESHOLD = 60  # Auto-reject if spam score > 60
    PROFANITY_THRESHOLD = 50  # Auto-reject if profanity score > 50
    AUTO_APPROVE_THRESHOLD = 20  # Auto-approve if total score < 20

    @staticmethod
    def should_auto_reject(content, user=None):
        """
        Check if comment should be auto-rejected
        Returns: (bool, reason)
        """
        # Check spam score
        spam_score = SpamDetector.spam_score(content, user)
        if spam_score > AutoModerator.SPAM_THRESHOLD:
            return True, f'spam_score_high:{spam_score}'

        # Check profanity score
        profanity_score = ProfanityFilter.profanity_score(content)
        if profanity_score > AutoModerator.PROFANITY_THRESHOLD:
            return True, f'profanity_score_high:{profanity_score}'

        # Check blacklisted IPs (if implemented)
        # ...

        return False, None

    @staticmethod
    def should_auto_approve(content, user=None):
        """
        Check if comment should be auto-approved
        Returns: (bool, reason)
        """
        # Trusted users (verified, good history)
        if user and hasattr(user, 'is_verified') and user.is_verified:
            # Check if user has good comment history
            if user.user_type in ['subscriber', 'premium', 'author', 'editor']:
                total_score = SpamDetector.spam_score(content, user)
                total_score += ProfanityFilter.profanity_score(content)

                if total_score < AutoModerator.AUTO_APPROVE_THRESHOLD:
                    return True, 'trusted_user_low_score'

        return False, None

    @staticmethod
    def moderate_comment(content, user=None):
        """
        Moderate comment and return status
        Returns: ('approved' | 'pending' | 'spam' | 'rejected', reason, scores)
        """
        # Calculate scores
        spam_score = SpamDetector.spam_score(content, user)
        profanity_score = ProfanityFilter.profanity_score(content)
        total_score = (spam_score + profanity_score) / 2

        scores = {
            'spam_score': spam_score,
            'profanity_score': profanity_score,
            'total_score': total_score
        }

        # Check for auto-reject
        should_reject, reject_reason = AutoModerator.should_auto_reject(content, user)
        if should_reject:
            if spam_score > profanity_score:
                return 'spam', reject_reason, scores
            else:
                return 'rejected', reject_reason, scores

        # Check for auto-approve
        should_approve, approve_reason = AutoModerator.should_auto_approve(content, user)
        if should_approve:
            return 'approved', approve_reason, scores

        # Default: pending review
        return 'pending', 'manual_review_required', scores


class ModerationStats:
    """
    Moderation statistics and reporting
    """

    @staticmethod
    def get_user_moderation_stats(user):
        """
        Get moderation statistics for a user
        """
        from apps.comments.models import Comment

        comments = Comment.objects.filter(user=user)

        stats = {
            'total_comments': comments.count(),
            'approved': comments.filter(status='approved').count(),
            'pending': comments.filter(status='pending').count(),
            'spam': comments.filter(status='spam').count(),
            'rejected': comments.filter(status='rejected').count(),
            'approval_rate': 0
        }

        if stats['total_comments'] > 0:
            stats['approval_rate'] = (
                stats['approved'] / stats['total_comments']
            ) * 100

        return stats

    @staticmethod
    def get_content_flags(text):
        """
        Get all flags for a piece of content
        """
        flags = []

        # Profanity check
        has_profanity, bad_words = ProfanityFilter.contains_profanity(text)
        if has_profanity:
            flags.append({
                'type': 'profanity',
                'severity': 'high',
                'details': f'Contains {len(bad_words)} profane words'
            })

        # URL spam check
        has_url_spam, url_count = SpamDetector.check_url_spam(text)
        if has_url_spam:
            flags.append({
                'type': 'url_spam',
                'severity': 'medium',
                'details': f'Contains {url_count} URLs'
            })

        # All caps check
        is_caps, caps_ratio = SpamDetector.check_all_caps(text)
        if is_caps:
            flags.append({
                'type': 'all_caps',
                'severity': 'low',
                'details': f'{int(caps_ratio * 100)}% uppercase'
            })

        # Repeated characters
        has_repeated, matches = SpamDetector.check_repeated_characters(text)
        if has_repeated:
            flags.append({
                'type': 'repeated_chars',
                'severity': 'low',
                'details': f'Contains {len(matches)} repeated character sequences'
            })

        return flags
