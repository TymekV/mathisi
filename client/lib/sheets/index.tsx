import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import NewSheet from './new';

registerSheet('new', NewSheet);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module 'react-native-actions-sheet' {
    interface Sheets {
        new: SheetDefinition;
    }
}
