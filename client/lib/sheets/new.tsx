import { SheetOption } from '@/components/sheet-option';
import { StyledActionSheet } from '@/components/styled-action-sheet';
import { useNew } from '@/hooks/use-new';
import { addAttachments } from '@/lib/state/ai-note-draft';
import { emitAiNoteStatus, emitAiNoteUploading } from '@/lib/state/ai-note-status-bridge';
import { IconCamera, IconNotebook, IconPencil, IconSparkles } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { useTheme, Text } from 'react-native-paper';

export default function NewSheet({ sheetId, payload }: SheetProps<'new'>) {
    const theme = useTheme();
    const newNote = useNew();
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
                            router.push('/new');
                            SheetManager.hide(sheetId);
                        }}
                    />
                    <SheetOption
                        icon={({ size, color }) => <IconSparkles size={size} color={color} />}
                        label="With AI"
                        onPress={async () => {
                            SheetManager.hide(sheetId);
                            router.push('/new');
                            // emitAiNoteUploading(true);
                            // try {
                            //     const files = await newNote.pickImage({
                            //         onStatus: emitAiNoteStatus,
                            //     });
                            //     if (files.length) {
                            //         addAttachments(files);
                            //     }
                            // } catch (error) {
                            //     console.error('Failed to process files', error);
                            // } finally {
                            //     emitAiNoteUploading(false);
                            //     emitAiNoteStatus('');
                            // }
                        }}
                    />
                </View>
            </View>
        </StyledActionSheet>
    );
}
