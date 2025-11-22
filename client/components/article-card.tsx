import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, Surface, Text } from "react-native-paper";

type Props = {
    title: string,

    ///
    /// PIERWSZE DWA-TRZY ZDANIA NOTATKI, PROSZE NIE ZAPOMNI SPARSOWAC DO KROPEK
    ///
    desc: string,
    author: string,
    upvotes: number,
    time_ago: string 

};


export default function ArticleCard({ title, desc, author,upvotes, time_ago }: Props) {

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
                    <Text style={styles.title}>{title}</Text>
                }
                subtitleNumberOfLines={3}
            />
            <Card.Content style={styles.cardContent}>
                <Text>{desc}</Text>
            </Card.Content>
            <Card.Actions style={styles.actions}>
                
                <View style={styles.flex} >
                    <Pressable>
                        <Entypo name="arrow-bold-up" size={24} color="black" />
                    </Pressable>
                    <Text>
                        {upvotes}
                    </Text>
                    <Pressable>
                        <Entypo name="arrow-bold-down" size={24} color="black" />
                    </Pressable>
                </View>
                
                <Pressable>
                    <FontAwesome name="bookmark" size={24} color="black" />
                </Pressable>
                <Pressable>
                    <FontAwesome5 name="share" size={24} color="black" />
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
    details:{
        paddingLeft: 10
    },
    actions:{
        paddingTop: 7,
        paddingBottom: 7,
        gap: 15
    }

});