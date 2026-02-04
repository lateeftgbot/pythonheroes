import { useSoftDelete } from '@/hooks/useSoftDelete';

interface UserStatusIndicatorProps {
    is_active?: boolean;
    is_verified?: boolean;
    is_online?: boolean;
    is_deleted?: boolean;
    userId?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * UserStatusIndicator - A reusable component that displays a colored dot
 * indicating the user's current status.
 * 
 * Status priority (highest to lowest):
 * 1. Suspended (black) - !is_active
 * 2. Unverified (yellow) - !is_verified
 * 3. Online (green) - is_online
 * 4. Offline (red) - default
 */
const UserStatusIndicator = ({
    is_active = true,
    is_verified = true,
    is_online = false,
    is_deleted = false,
    userId,
    size = 'md',
    className = ''
}: UserStatusIndicatorProps) => {
    const { isDeleted } = useSoftDelete();
    const isSoftDeleted = userId ? isDeleted(userId) : false;

    // Determine status color and label
    const getStatusInfo = () => {
        if (is_deleted || isSoftDeleted) {
            return {
                color: 'bg-red-600',
                shadow: 'shadow-[0_0_8px_rgba(220,38,38,0.6)]',
                label: 'Scheduled for Deletion',
                icon: true
            };
        }
        if (!is_active) {
            return {
                color: 'bg-black',
                shadow: 'shadow-[0_0_8px_rgba(0,0,0,0.6)]',
                label: 'Suspended',
                icon: false
            };
        }
        if (!is_verified) {
            return {
                color: 'bg-yellow-500',
                shadow: 'shadow-[0_0_8px_rgba(234,179,8,0.6)]',
                label: 'Unverified',
                icon: false
            };
        }
        if (is_online) {
            return {
                color: 'bg-green-500',
                shadow: 'shadow-[0_0_8px_rgba(34,197,94,0.6)]',
                label: 'Online',
                icon: false
            };
        }
        return {
            color: 'bg-red-500',
            shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]',
            label: 'Offline',
            icon: false
        };
    };

    // Size variants
    const sizeClasses = {
        sm: 'w-2 h-2 border-2',
        md: 'w-2.5 h-2.5 border-2',
        lg: 'w-5 h-5 border-4'
    };

    const status = getStatusInfo();

    return (
        <div
            className={`absolute -top-0.5 -right-0.5 ${sizeClasses[size]} rounded-full border-background ${status.color} ${status.shadow} ${className} flex items-center justify-center`}
            title={status.label}
        >
            {status.icon && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[60%] h-[60%] text-white"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            )}
        </div>
    );
};

export default UserStatusIndicator;
