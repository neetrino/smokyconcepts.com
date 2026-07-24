import { Card } from '@shop/ui';
import { UserAvatar } from '../../components/UserAvatar';
import { ProfileMenuDrawer } from '../../components/ProfileMenuDrawer';
import type { UserProfile, ProfileTab, ProfileTabConfig } from './types';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  tabs: ProfileTabConfig[];
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  t: (key: string) => string;
}

export function ProfileHeader({ profile, tabs, activeTab, onTabChange, t }: ProfileHeaderProps) {
  return (
    <>
      <div className="lg:w-64 flex-shrink-0">
        {/* Profile Header Section */}
        <Card className="mb-4 border-gray-200 bg-white p-4">
          <div className="flex flex-row items-center gap-4">
            {/* Avatar */}
            <UserAvatar
              firstName={profile?.firstName}
              lastName={profile?.lastName}
              size="lg"
              className="flex-shrink-0"
            />
            
            {/* User Info */}
            <div className="flex-1 min-w-0 break-words">
              <h1 className="mb-1 break-words text-lg font-bold text-[#122a26]">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile?.firstName
                  ? profile.firstName
                  : profile?.lastName
                  ? profile.lastName
                  : t('profile.myProfile')}
              </h1>
              {profile?.email && (
                <p className="mb-1 break-words text-sm font-semibold text-[#122a26]">{profile.email}</p>
              )}
              {profile?.phone && (
                <p className="break-words text-sm text-[#414141]/70">{profile.phone}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Sidebar Navigation */}
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
          </nav>
        </aside>
      </div>

      {/* Mobile Menu Drawer */}
      <div className="lg:hidden mb-6">
        <ProfileMenuDrawer
          tabs={tabs}
          activeTab={activeTab}
          onSelect={(tabId) => onTabChange(tabId as ProfileTab)}
        />
      </div>
    </>
  );
}



