import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminLoadingState from '../components/AdminLoadingState';
import CommandCenterModal from '../components/CommandCenterModal';
import { getAdminSession, verifyAdminSession } from '../services/registrationService';

export default function AdminLayout() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = window.location.pathname;
  const isInvitationRoute = /^\/admin\/invite\//.test(location);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      if (isInvitationRoute) {
        if (isMounted) {
          setIsAuthorized(true);
          setIsChecking(false);
        }
        return;
      }

      const session = getAdminSession();
      if (!session) {
        if (isMounted) {
          setIsAuthorized(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        await verifyAdminSession();
        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch {
        if (isMounted) {
          setIsAuthorized(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [isInvitationRoute]);

  if (isChecking) {
    return <AdminLoadingState />;
  }

  if (!isAuthorized) {
    return (
      <>
        <CommandCenterModal
          open={!isChecking && !isAuthorized}
          onClose={() => {
            window.location.assign('/');
          }}
        />
      </>
    );
  }

  return <Outlet />;
}
