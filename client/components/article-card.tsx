import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from 'expo-router';
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, Surface, Text } from "react-native-paper";

type Props = {
    id: number,
    title: string,

    ///
    /// PIERWSZE DWA-TRZY ZDANIA NOTATKI, PROSZE NIE ZAPOMNI SPARSOWAC DO KROPEK
    ///
    desc: string,
    author: string,
    upvotes: number,
    time_ago: string

};


export default function ArticleCard({ id,title, desc, author, upvotes, time_ago }: Props) {

    return (
        <Card>
            <Card.Title
                // kill it please
                title={
                    <Text>
                        <View>
                            <Surface style={styles.authorIcon} elevation={0}>

                                {/*
                                <Image>
                                </Image>
                                 
                                placeholder
                                 |
                                \|/
                                */}
                                <View></View>
                            </Surface>
                        </View>
                        <View style={styles.details}>
                            <Text>{author}</Text>
                            <Text>{time_ago}</Text>
                        </View>
                    </Text>
                }
                subtitle={
                    <Text
                        onPress={() =>
                            router.navigate({
                                pathname: '/article/[id]',
                                params: { id: id }
                            })
                        }

                        style={styles.title}
                    >
                        {title}
                    </Text>
                }
                subtitleNumberOfLines={3}
            />
            <Card.Content style={styles.cardContent}>
                <Text>{desc}</Text>
            </Card.Content>
            <Card.Actions style={styles.actions}>

                <View style={styles.flex} >
                    <Pressable>
                        <Text><Entypo name="arrow-bold-up" size={24} /></Text>
                    </Pressable>
                    <Text>
                        {upvotes}
                    </Text>
                    <Pressable>
                        <Text><Entypo name="arrow-bold-down" size={24} /></Text>
                    </Pressable>
                </View>

                <Pressable>
                    <Text><FontAwesome name="bookmark" size={24} /></Text>
                </Pressable>
                <Pressable>
                    <Text><FontAwesome5 name="share" size={24} /></Text>
                </Pressable>

            </Card.Actions>
        </Card>
    );
}

const styles = StyleSheet.create({
    cardContent:
    {
        padding: 5
    },
    flex:
    {
        flex: 1,
        flexDirection: "row"
    },
    authorIcon: {
        width: 32,
        height: 32,
        backgroundColor: 'gray'
    },
    title: {
        fontSize: 24,
    },
    details: {
        paddingLeft: 10
    },
    actions: {
        paddingTop: 7,
        paddingBottom: 7,
        gap: 15
    }

});