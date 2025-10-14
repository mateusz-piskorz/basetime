import { AppearanceToggle } from '@/components/common/appearance-toggle';
import { AuthButton } from '@/components/common/auth-button';
import { NAV_LIST } from '@/lib/constants/nav-list';
import Link from 'next/link';

export const DesktopNavigation = () => {
    return (
        <div className="hidden items-center gap-8 lg:flex">
            <nav>
                <ul className="flex list-none flex-row items-center gap-11">
                    {NAV_LIST.map((item) => (
                        <li className="cursor-pointer" key={item.label}>
                            <Link className="font-mono" href={item.href}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <AuthButton />
                    </li>
                </ul>
            </nav>
            <div className="space-x-4">
                <AppearanceToggle variant="icon" align="end" />
            </div>
        </div>
    );
};
