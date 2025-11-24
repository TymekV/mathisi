import ArticleCard from '@/components/article-card';
import { apiBaseUrl } from '@/constants/apiBaseUrl';
import { paths } from '@/types/api';
import { article } from '@/types/article';
import * as SecureStore from 'expo-secure-store';
import createClient from 'openapi-fetch';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';



export default function HomeScreen() {

  const [searchQuery, setSearchQuery] = React.useState('');
  const [notes, setNotes] = useState<article[]>([])

  const $api = createClient<paths>({
    baseUrl: apiBaseUrl,
  });

  useEffect(() => {
    getArticles()
  }, []);

  async function getArticles() {
    const token = await SecureStore.getItemAsync("token");

    const { data, error } = await $api.GET("/api/notes", {
      headers: {
        Authorization: token
      },
    });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setNotes(data.notes);
    }
  }
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    getArticles()
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
      }
    >

      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />

      <FlatList
        data={notes}
        renderItem={({ item }) =>
          <View style={styles.cardContainer} >
            <ArticleCard article={item} />
          </View>
        }
      />
      {/* lazy loading waits for you ^^  */}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingTop: 7,
    paddingBottom: 7,
  }
});