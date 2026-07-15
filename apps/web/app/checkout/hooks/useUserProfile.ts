import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { CheckoutFormData } from '../types';
import type { DeliveryLocationOption } from './useDeliveryLocations';

type ProfileAddressResponse = {
  id: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  isDefault?: boolean;
};

type ProfileResponse = {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  addresses?: ProfileAddressResponse[];
};

function setContactFormValues(
  values: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  },
  setValue: UseFormSetValue<CheckoutFormData>,
) {
  if (values.firstName) {
    setValue('firstName', values.firstName);
  }
  if (values.lastName) {
    setValue('lastName', values.lastName);
  }
  if (values.email) {
    setValue('email', values.email);
  }
  if (values.phone) {
    setValue('phone', values.phone);
  }
}

function resolveRegionByAddressState(
  stateValue: string | undefined,
  deliveryLocations: DeliveryLocationOption[],
) {
  const stateTrim = stateValue?.trim();
  if (!stateTrim || deliveryLocations.length === 0) {
    return null;
  }

  const byId = deliveryLocations.find((location) => location.id === stateTrim);
  if (byId) {
    return byId;
  }

  return (
    deliveryLocations.find(
      (location) => location.city.toLowerCase() === stateTrim.toLowerCase(),
    ) ?? null
  );
}

function applyDefaultAddressToCheckoutForm(
  address: ProfileAddressResponse,
  deliveryLocations: DeliveryLocationOption[],
  setValue: UseFormSetValue<CheckoutFormData>,
) {
  const line1 = address.addressLine1?.trim();
  if (line1) {
    const line2 = address.addressLine2?.trim();
    setValue('shippingAddress', line2 ? `${line1}, ${line2}` : line1);
  }

  const matchedRegion = resolveRegionByAddressState(address.state, deliveryLocations);
  if (matchedRegion) {
    setValue('shippingCountry', matchedRegion.country);
    setValue('shippingRegion', matchedRegion.id);
  }
}

export function useUserProfile(
  isLoggedIn: boolean,
  isLoading: boolean,
  setValue: UseFormSetValue<CheckoutFormData>,
  deliveryLocations: DeliveryLocationOption[],
) {
  const { user } = useAuth();

  useEffect(() => {
    async function loadUserProfile() {
      if (isLoading) {
        return;
      }

      if (!isLoggedIn) {
        return;
      }

      if (user) {
        setContactFormValues(user, setValue);
      }

      try {
        const profile = await apiClient.get<ProfileResponse>('/api/v1/users/profile');
        setContactFormValues(profile, setValue);

        const addresses = profile.addresses ?? [];
        if (addresses.length === 0) {
          return;
        }

        const defaultAddress =
          addresses.find((address) => address.isDefault) ?? addresses[0];
        applyDefaultAddressToCheckoutForm(defaultAddress, deliveryLocations, setValue);
      } catch {
        // Silently fail - use auth context data instead
      }
    }

    void loadUserProfile();
  }, [isLoggedIn, isLoading, user?.id, setValue, deliveryLocations]);
}
