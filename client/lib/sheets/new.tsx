import { SheetOption } from '@/components/sheet-option';
import { StyledActionSheet } from '@/components/styled-action-sheet';
import { IconNotebook, IconPencil, IconSparkles } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { useTheme, Text } from 'react-native-paper';

export default function NewSheet({ sheetId, payload }: SheetProps<'new'>) {
    const theme = useTheme();
    const router = useRouter();

    return (
        <StyledActionSheet gestureEnabled={true}>
            <View className="p-4">
                <View className="items-center flex">
                    <View
                        style={{
                            backgroundColor: theme.colors.primary,
                            width: 64,
                            height: 64,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '100%',
                        }}
                    >
                        <IconNotebook size={48} color={theme.colors.onPrimary} strokeWidth={1.4} />
                    </View>
                    <Text variant="headlineSmall" style={{ marginTop: 12, marginBottom: 16 }}>
                        Create a Note
                    </Text>
                </View>
                <View style={{ gap: 10 }}>
                    <SheetOption
                        icon={({ size, color }) => <IconPencil size={size} color={color} />}
                        label="From Scratch"
                        onPress={() => {
                            SheetManager.hide(sheetId);
                            router.push('/new/manual');
                        }}
                    />
                    <SheetOption
                        icon={({ size, color }) => <IconSparkles size={size} color={color} />}
                        label="With AI"
                        onPress={() => {
                            SheetManager.hide(sheetId);
                            router.push('/new/ai');
                        }}
                    />
                </View>
            </View>
        </StyledActionSheet>
    );
}
