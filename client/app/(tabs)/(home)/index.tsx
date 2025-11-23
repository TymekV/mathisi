import { ScrollView, StyleSheet, View } from 'react-native';

import ArticleCard from '@/components/article-card';
import React from 'react';
import { Searchbar } from 'react-native-paper';

const sample = [
  {
    title: "The Rise of Functional Programming",
    desc: "Functional programming emphasizes pure functions and immutability, leading to more predictable codebases. This paradigm is rapidly gaining traction in modern web and application development. Its inherent support for concurrent operations makes it highly valuable.",
    author: "Alice Smith",
    upvotes: 45,
    id: 1
  },
  {
    title: "Deep Sea Hydrothermal Vents",
    desc: "These underwater ecosystems thrive on chemosynthesis rather than sunlight, making them unique on Earth. They host life forms, like giant tube worms, that are entirely independent of surface ecology. Scientists continue to study their resilience in extreme conditions.",
    author: "Dr. Finn Ocean",
    upvotes: 123,
    id: 2
  },
  {
    title: "The History of the Roman Aqueducts",
    desc: "Roman engineers utilized gravity and precise gradients to transport water over vast distances to their major cities. These structures were vital for public health and sanitation in the sprawling empire. Many of these incredible architectural feats are still standing and visible today.",
    author: "Historian Bob",
    upvotes: 98,
    id: 3
  },
  {
    title: "Coffee Brewing: The Science of Extraction",
    desc: "Water temperature and grind size are the two most critical variables in achieving perfect coffee extraction. Too fine a grind or too hot water can lead to bitter, over-extracted coffee, while the opposite results in sour flavors. Achieving balance in these variables is the key to a perfect cup every morning.",
    author: "Caffeine King",
    upvotes: 205,
    id: 4
  },
];


export default function HomeScreen() {
 
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <ScrollView>

    <Searchbar
      placeholder="Search"
      onChangeText={setSearchQuery}
      value={searchQuery}
    />

      {sample.map((item,index) => 
      <View style={styles.cardContainer} key={index}>
        <ArticleCard id={item.id} title={item.title} desc={item.desc} author={item.author} upvotes={item.upvotes ? item.upvotes : 0} time_ago='2 minutes'/>
      </View>
      )}
      {/* lazy loading waits for you ^^  */}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardContainer:{
    paddingTop: 7,
    paddingBottom: 7,
  }
});