import { lmsStorage } from './newStorage';

export async function createMockUsers() {
  try {
    console.log('Creating mock users...');

    // Create 2 Admin Users
    const admins = [
      {
        id: 'admin_001',
        email: 'admin1@test.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        userType: 'subscriber_admin' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'admin_002',
        email: 'admin2@test.com',
        firstName: 'Michael',
        lastName: 'Chen',
        userType: 'subscriber_admin' as const,
        organizationId: 1,
        profileImageUrl: null
      }
    ];

    // Create 5 Teachers
    const teachers = [
      {
        id: 'teacher_001',
        email: 'teacher1@test.com',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        userType: 'teacher' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'teacher_002',
        email: 'teacher2@test.com',
        firstName: 'David',
        lastName: 'Thompson',
        userType: 'teacher' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'teacher_003',
        email: 'teacher3@test.com',
        firstName: 'Lisa',
        lastName: 'Anderson',
        userType: 'teacher' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'teacher_004',
        email: 'teacher4@test.com',
        firstName: 'James',
        lastName: 'Wilson',
        userType: 'teacher' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'teacher_005',
        email: 'teacher5@test.com',
        firstName: 'Maria',
        lastName: 'Garcia',
        userType: 'teacher' as const,
        organizationId: 1,
        profileImageUrl: null
      }
    ];

    // Create 10 Students
    const students = [
      {
        id: 'student_001',
        email: 'student1@test.com',
        firstName: 'Alex',
        lastName: 'Smith',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'student_002',
        email: 'student2@test.com',
        firstName: 'Jessica',
        lastName: 'Brown',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'student_003',
        email: 'student3@test.com',
        firstName: 'Tyler',
        lastName: 'Davis',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'student_004',
        email: 'student4@test.com',
        firstName: 'Amanda',
        lastName: 'Miller',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'student_005',
        email: 'student5@test.com',
        firstName: 'Chris',
        lastName: 'Taylor',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'student_006',
        email: 'student6@test.com',
        firstName: 'Rachel',
        lastName: 'Moore',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'student_007',
        email: 'student7@test.com',
        firstName: 'Kevin',
        lastName: 'Jackson',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'student_008',
        email: 'student8@test.com',
        firstName: 'Nicole',
        lastName: 'White',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'student_009',
        email: 'student9@test.com',
        firstName: 'Brandon',
        lastName: 'Harris',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      },
      {
        id: 'student_010',
        email: 'student10@test.com',
        firstName: 'Stephanie',
        lastName: 'Clark',
        userType: 'student' as const,
        organizationId: 1,
        profileImageUrl: null
      }
    ];

    // Insert all mock users
    const allUsers = [...admins, ...teachers, ...students];
    
    for (const user of allUsers) {
      try {
        await lmsStorage.upsertUser(user);
        console.log(`Created user: ${user.firstName} ${user.lastName} (${user.userType})`);
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }

    console.log('Mock users creation completed!');
    return {
      admins: admins.length,
      teachers: teachers.length,
      students: students.length,
      total: allUsers.length
    };

  } catch (error) {
    console.error('Error in createMockUsers:', error);
    throw error;
  }
}