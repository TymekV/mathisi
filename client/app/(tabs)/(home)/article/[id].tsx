import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

export default function Users() {
    const { id } = useLocalSearchParams();

    return (
        <ScrollView>
            <Text>Article id: {id}</Text>
        </ScrollView>
    );
}
