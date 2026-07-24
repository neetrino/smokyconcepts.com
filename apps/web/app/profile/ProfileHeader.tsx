import { Card } from '@shop/ui';
import { ProfileMenuDrawer } from '../../components/ProfileMenuDrawer';
import { ProfileMenuAction } from './ProfileMenuAction';
import {
  ProfileCouponsIcon,
  ProfileDeleteAccountIcon,
  ProfileLogoutIcon,
} from './profile-menu-icons';
import type { UserProfile, ProfileTab, ProfileTabConfig } from './types';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  tabs: ProfileTabConfig[];
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
  t: (key: string) => string;
}

export function ProfileHeader({
  profile,
  tabs,
  activeTab,
  onTabChange,
  onDeleteAccount,
  onLogout,
  t,
}: ProfileHeaderProps) {
  return (
    <>
      <div className="lg:w-64 flex-shrink-0">
        <Card className="mb-4 border-gray-200 bg-white px-4 py-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-gray-200" />
              <div className="absolute inset-1 rounded-full border border-gray-100" />
              <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-black">
                <svg
                  className="h-10 w-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {profile?.firstName ? (
              <h1 className="break-words text-xl font-bold text-black">{profile.firstName}</h1>
            ) : (
              <h1 className="break-words text-xl font-bold text-black">{t('profile.myProfile')}</h1>
            )}
            {profile?.lastName ? (
              <p className="mt-0.5 break-words text-base text-gray-400">{profile.lastName}</p>
            ) : null}
          </div>
        </Card>

        <aside className="hidden lg:block">
          <nav className="space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#dcc090] text-[#122a26]'
                    : 'text-[#414141] hover:bg-[#dcc090]/12 hover:text-[#122a26]'
                }`}
              >
                <span
                  className={`flex-shrink-0 ${
                    activeTab === tab.id ? 'text-[#122a26]' : 'text-[#414141]/55'
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="text-left">{tab.label}</span>
              </button>
            ))}

            <ProfileMenuAction
              label={t('profile.menu.coupons')}
              icon={<ProfileCouponsIcon />}
              isActive={activeTab === 'coupons'}
              onClick={() => onTabChange('coupons')}
            />
            <ProfileMenuAction
              label={t('profile.menu.deleteAccount')}
              icon={<ProfileDeleteAccountIcon />}
              onClick={onDeleteAccount}
            />

            <div className="border-t border-gray-200 pt-1">
              <ProfileMenuAction
                label={t('common.navigation.logout')}
                icon={<ProfileLogoutIcon />}
                variant="danger"
                onClick={onLogout}
              />
            </div>
          </nav>
        </aside>
      </div>

      <div className="lg:hidden mb-6">
        <ProfileMenuDrawer
          tabs={tabs}
          activeTab={activeTab}
          onSelect={(tabId) => onTabChange(tabId as ProfileTab)}
          onCouponsSelect={() => onTabChange('coupons')}
          onDeleteAccount={onDeleteAccount}
          onLogout={onLogout}
          t={t}
        />
      </div>
    </>
  );
}
