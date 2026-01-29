/**
 * User Mapper
 *
 * Transform data between API and Domain models
 */

import { User, UserApiResponse, UserFormData } from '../models/user.types';

export class UserMapper {
  /**
   * Transform API response to Domain model
   * @param apiData API response
   * @returns Domain model
   */
  static toDomain(apiData: UserApiResponse): User {
    return {
      id: apiData.id,
      username: apiData.username,
      email: apiData.email,
      fullName: apiData.full_name,
      firstName: apiData.first_name,
      lastName: apiData.last_name,
      avatar: apiData.profile_picture,
      bio: apiData.bio,
      role: apiData.role,
      isActive: apiData.is_active,
      isStaff: apiData.is_staff,
      isSuperuser: apiData.is_superuser,
      dateJoined: new Date(apiData.date_joined),
      lastLogin: apiData.last_login ? new Date(apiData.last_login) : null,
    };
  }

  /**
   * Transform Form data to API request
   * @param formData Form data
   * @returns API request object
   */
  static toApiRequest(formData: UserFormData): Record<string, any> {
    const request: Record<string, any> = {
      username: formData.username,
      email: formData.email,
      full_name: formData.fullName,
      first_name: formData.firstName,
      last_name: formData.lastName,
      bio: formData.bio,
      role: formData.role,
      is_active: formData.isActive,
    };

    // Only include password if provided (for updates)
    if (formData.password) {
      request.password = formData.password;
    }

    return request;
  }

  /**
   * Transform multiple API items to Domain models
   * @param apiList Array of API responses
   * @returns Array of Domain models
   */
  static toDomainList(apiList: UserApiResponse[]): User[] {
    return apiList.map((item) => this.toDomain(item));
  }

  /**
   * Transform User to Form data (for editing)
   * @param user Domain model
   * @returns Form data
   */
  static toFormData(user: User): UserFormData {
    return {
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || undefined,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
