import { article } from '@/types/article';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, Surface, Text } from "react-native-paper";
type Props = {
    article: article
};



export default function ArticleCard({ article: art }: Props) {

    const [vote, setVote] = useState<number>(0);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    const queryClient = useQueryClient();

    const queryLike = useQuery({ queryKey: ['like'] })
    const querySave = useQuery({ queryKey: ['save'] })

    const mutationLike = useMutation({
        //mutationFn: postTodo,
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['like'] })
        },
    })

    const mutationSave = useMutation({
        //mutationFn: postTodo,
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['save'] })
        },
    })

    // todo refetch
    const mutation = useMutation({
    })

    function UpVote() {
        alert("upvoted")
    }
    function DownVoted() {
        alert("downvoted")
    }
    function Share() {
        alert("Promt to share with link");
    }
    function Save() {
        alert("Saved!");
    }
    function timeAgo(dateString: string) {
        // chatGPT generate function
        const now = new Date();
        const created = new Date(dateString);
        const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

        const intervals: Record<string, number> = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const key in intervals) {
            const value = intervals[key];
            const result = Math.floor(seconds / value);
            if (result >= 1) {
                return `${result} ${key}${result > 1 ? 's' : ''} ago`;
            }
        }

        return "just now";
    }


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
                            <Text>Made by {art.author}</Text>
                             <Text>{timeAgo(art.created_at)}</Text>
                        </View>
                    </Text>
                }
                subtitle={
                    <Text
                        onPress={() =>
                            router.navigate({
                                pathname: '/article/[id]',
                                params: { id: art.id }
                            })
                        }

                        style={styles.title}
                    >
                        {art.title}
                    </Text>
                }
                subtitleNumberOfLines={3}
            />
            <Card.Content style={styles.cardContent}>
                <Text>{art.desc}</Text>
            </Card.Content>
            <Card.Actions style={styles.actions}>

                <View style={styles.flex} >
                    <Pressable onPress={UpVote}>
                        <Text
                            style={
                                art.upvote === 1 ?
                                    {
                                        color: 'green'
                                    } :
                                    {

                                    }
                            }
                        ><Entypo name="arrow-bold-up" size={24} /></Text>
                    </Pressable>
                    <Text>
                        {art.upvotes}
                    </Text>
                    <Pressable onPress={DownVoted}>
                        <Text
                            style={
                                art.upvote === -1 ?
                                    {
                                        color: 'red'
                                    } :
                                    {

                                    }
                            }
                        ><Entypo name="arrow-bold-down" size={24} /></Text>
                    </Pressable>
                </View>

                <Pressable onPress={Save}>
                    <Text
                        style={
                            art.saved === true ?
                                {
                                    color: 'cyan'
                                }
                                :
                                {

                                }
                        }
                    ><FontAwesome name="bookmark" size={24} /></Text>
                </Pressable>
                <Pressable onPress={Share}>
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