import { apiBaseUrl } from '@/constants/apiBaseUrl';
import { getAuthToken } from '@/lib/auth/token';
import { apiClient } from '@/lib/providers/api';
import type { components } from '@/types/api';
import * as ImagePicker from 'expo-image-picker';
import { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Surface, Text } from 'react-native-paper';

type User = components['schemas']['UserResponse'];


function UserProfileComponent() {
  const userQuery = apiClient.useQuery('get', '/api/user');

  const uploadAvatar = apiClient.useMutation('put', '/api/user/{id}/avatar');
  const [avatarKey, setAvatarKey] = useState(Date.now());

  const [token, setToken] = useState<string>("")

  useEffect(() => {
    (async () => {
      const token = await getAuthToken() || "";
      setToken(token);
    })();
  }, []);

  async function send() {
    if (!user?.id) {
      alert('User not loaded');
      return;
    }

    if (!token) {
      alert('Auth token not available');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (pickerResult.canceled || !pickerResult.assets?.length) {
      return;
    }

    const asset = pickerResult.assets[0];

    if (asset.mimeType && asset.mimeType !== 'image/png') {
      alert('Please select a PNG image');
      return;
    }

    const fileResponse = await fetch(asset.uri);
    const blob = await fileResponse.blob();

    console.log(`${apiBaseUrl}api/user/${user.id}/avatar`)
    const res = await fetch(`${apiBaseUrl}api/user/${user.id}/avatar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
        'Authorization': token,
      },
      body: blob,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');

      console.warn('Avatar upload failed:', res.status, text);
      alert('Failed to upload profile picture');
      return;
    }

    // Bust cache so the new avatar is fetched
    setAvatarKey(Date.now());
  }

  const joinedLabel = useMemo(() => {
    if (!userQuery.data?.created_at) return '';
    return new Date(userQuery.data.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [userQuery.data?.created_at]);

  if (userQuery.isPending) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator animating />
      </View>
    );
  }

  const user: User | undefined = userQuery.data;

  if (!user) {
    return (
      <View style={styles.loader}>
        <Text variant="bodyMedium">We couldn't load your profile.</Text>
      </View>
    );
  }

  const avatarUri = user.has_profile_picture
    ? `${apiBaseUrl}api/user/${user.id}/avatar?v=${avatarKey}`
    : undefined;

  return (
    <Surface style={styles.container} elevation={1}>
      {avatarUri && token ? (
        <Avatar.Image
          size={56}
          source={{ uri: avatarUri, headers: { Authorization: token } }}
        />
      ) : (
        <Avatar.Text
          label={user.username.slice(0, 2).toUpperCase()}
          size={56}
        />
      )}

      <View style={styles.details}>
        <Text variant="titleMedium">{user.username}</Text>
        <Text variant="bodyMedium" style={styles.subtle}>
          {user.email}
        </Text>
        <Text variant="bodySmall" style={styles.subtle}>
          Member since {joinedLabel}
        </Text>
        <Button mode="outlined" onPress={send} style={{ marginTop: 20 }}>
          Upload profile picture
        </Button>

      </View>

    </Surface>
  );
}

export const UserProfile = memo(UserProfileComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  details: {
    flex: 1,
  },
  subtle: {
    opacity: 0.7,
  },
  loader: {
    padding: 24,
    alignItems: 'center',
  },
});