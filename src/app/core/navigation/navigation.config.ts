export interface NavigationItem {
    label: string;
    route: string;
    icon: string;
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const NAVIGATION_CONFIG: Record<string, NavigationSection[]> = {

    SUPER_ADMIN: [
        {
            title: 'MAIN',
            items: [
                {
                    label: 'Dashboard',
                    route: '/super-admin/dashboard',
                    icon: '⌂'
                }
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                {
                    label: 'Admins',
                    route: '/super-admin/admins',
                    icon: '♙'
                }
            ]
        }
    ],

    ADMIN: [
        {
            title: 'MAIN',
            items: [
                {
                    label: 'Dashboard',
                    route: '/admin/dashboard',
                    icon: '⌂'
                }
            ]
        },
        {
            title: 'INSIDER',
            items: [
                {
                    label: 'Students Insider',
                    route: '/admin/insider/students',
                    icon: '◉'
                },
                {
                    label: 'Fees Insider',
                    route: '/admin/fees-insider',
                    icon: '₹'
                }
            ]
        },
        {
            title: 'ACADEMIC',
            items: [
                {
                    label: 'Academic Years',
                    route: '/admin/academic-years',
                    icon: '▦'
                },
                {
                    label: 'Classes',
                    route: '/admin/classes',
                    icon: '▤'
                },
                {
                    label: 'Subjects',
                    route: '/admin/subjects',
                    icon: '▤'
                }
            ]
        },
        {
            title: 'FEES',
            items: [
                {
                    label: 'Fee Structures',
                    route: '/admin/fees/fee-structures',
                    icon: '₹'
                },
                {
                    label: 'Student Fees',
                    route: '/admin/fees/student-fees',
                    icon: '₹'
                },
                {
                    label: 'Receipt Settings',
                    route: '/admin/fees/receipt-settings',
                    icon: '₹'
                }
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                {
                    label: 'Teachers',
                    route: '/admin/teachers',
                    icon: '♙'
                },
                {
                    label: 'Teacher Roles',
                    route: '/admin/teacher-roles',
                    icon: '♙'
                },
                {
                    label: 'Teacher Role Assignments',
                    route: '/admin/teacher-role-assignments',
                    icon: '♙'
                },
                {
                    label: 'Teacher Assignments',
                    route: '/admin/teacher-assignments',
                    icon: '≡'
                },
                {
                    label: 'Students',
                    route: '/admin/students',
                    icon: '♙'
                },
                {
                    label: 'Assignments',
                    route: '/admin/assignments',
                    icon: '≡'
                },
                {
                    label: 'Attendance',
                    route: '/admin/attendance',
                    icon: '✓'
                }
            ]
        }
    ],

    TEACHER: [
        {
            title: 'MAIN',
            items: [
                {
                    label: 'Dashboard',
                    route: '/teacher/dashboard',
                    icon: '⌂'
                }
            ]
        },
        {
            title: 'TEACHING',
            items: [
                {
                    label: 'My Assignments',
                    route: '/teacher/assignments',
                    icon: '≡'
                },
                {
                    label: 'Students',
                    route: '/teacher/students',
                    icon: '♙'
                },
                {
                    label: 'Attendance',
                    route: '/teacher/attendance',
                    icon: '✓'
                }
            ]
        }
    ],

    STUDENT: [
        {
            title: 'MAIN',
            items: [
                {
                    label: 'Dashboard',
                    route: '/student/dashboard',
                    icon: '⌂'
                }
            ]
        },
        {
            title: 'MY ACCOUNT',
            items: [
                {
                    label: 'Attendance',
                    route: '/student/attendance',
                    icon: '✓'
                },
                {
                    label: 'Fees',
                    route: '/student/fees',
                    icon: '₹'
                }
            ]
        }
    ]
};