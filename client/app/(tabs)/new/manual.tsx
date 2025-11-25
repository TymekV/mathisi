import { NoteComposer } from '@/components/note-composer';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function AddNewScreen() {
    const theme = useTheme();
    const [composerKey, setComposerKey] = useState(0);

    const handleClose = useCallback(() => {
        setComposerKey((prev) => prev + 1);
    }, []);

    return (
        <View style={styles.container(theme.colors.background)}>
            <NoteComposer key={`manual-${composerKey}`} initialContent="" onClose={handleClose} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: (backgroundColor: string) => ({
        flex: 1,
        backgroundColor,
    }),
});
