declare module "utils/Utils" {
    import { KeyValuePair } from '@opd-libs/opd-utils-lib/lib/Utils';
    /**
     * Gets the file name from a path
     *
     * @param path
     */
    export function getFileName(path: string): string;
    /**
     * Checks if a path is a path or a file name
     *
     * @param path
     */
    export function isPath(path: string): boolean;
    /**
     * Removes the file ending of a file name
     *
     * @param fileName
     */
    export function removeFileEnding(fileName: string): string;
    /**
     * Clamp, unused
     *
     * @param num
     * @param min
     * @param max
     */
    export function clamp(num: number, min: number, max: number): number;
    /**
     * js can't even implement modulo correctly...
     *
     * @param n
     * @param m
     */
    export function mod(n: number, m: number): number;
    /**
     * Checks if 2 arrays contain equal values, the arrays should have the same datatype
     *
     * @param arr1
     * @param arr2
     */
    export function doArraysContainEqualValues<T>(arr1: T[], arr2: T[]): boolean;
    /**
     * Checks if 2 arrays are equal, the arrays should have the same datatype
     *
     * @param arr1
     * @param arr2
     *
     * @returns true if the two arrays are equal
     */
    export function arrayEquals<T>(arr1: T[], arr2: T[]): boolean;
    export function isTruthy(value: any): boolean;
    export function isFalsy(value: any): boolean;
    export function equalOrIncludes(str1: string, str2: string): boolean;
    export function numberToString(n: number | string): string;
    export function traverseObjectToParentByPath(pathParts: string[], o: any): {
        parent: KeyValuePair<string[], any>;
        child: KeyValuePair<string, any>;
    };
    export function getVaultBasePath(): string | null;
    export function pathJoin(path1: string, path2: string): string;
    export function imagePathToUri(imagePath: string): string;
}
declare module "inputFields/DatePicker/DatePickerInputSvelteHelpers" {
    export interface Weekday {
        index: number;
        name: string;
        shortName: string;
    }
    export const weekdays: Weekday[];
    export let firstWeekday: Weekday;
    export function setFirstWeekday(w: Weekday): void;
    export function getMonthName(index: number): string;
    export function getDateRows(monthIndex: number, year: number): number[];
    export function getWeekDay(date: Date): number;
    export function getWeekDays(): string[];
    export function uuid(): () => number;
}
declare module "settings/Settings" {
    import { App, PluginSettingTab } from 'obsidian';
    import MetaBindPlugin from "main";
    import { Weekday } from "inputFields/DatePicker/DatePickerInputSvelteHelpers";
    export interface MetaBindPluginSettings {
        devMode: boolean;
        ignoreCodeBlockRestrictions: boolean;
        preferredDateFormat: string;
        useUsDateInputOrder: boolean;
        firstWeekday: Weekday;
        syncInterval: number;
        maxSyncInterval: number;
        minSyncInterval: number;
        inputTemplates: string;
    }
    export const DEFAULT_SETTINGS: MetaBindPluginSettings;
    export class MetaBindSettingTab extends PluginSettingTab {
        plugin: MetaBindPlugin;
        constructor(app: App, plugin: MetaBindPlugin);
        display(): void;
    }
}
declare module "utils/MetaBindErrors" {
    export class MetaBindInternalError extends Error {
        constructor(message: string);
    }
    export class MetaBindParsingError extends Error {
        constructor(message: string);
    }
    export class MetaBindBindTargetError extends Error {
        constructor(message: string);
    }
    export class MetaBindValueError extends Error {
        constructor(message: string);
    }
    export class MetaBindArgumentError extends Error {
        constructor(message: string);
    }
    export class MetaBindJsError extends Error {
        constructor(message: string);
    }
}
declare module "inputFields/AbstractInputField" {
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    export abstract class AbstractInputField {
        static allowBlock: boolean;
        static allowInline: boolean;
        renderChild: InputFieldMarkdownRenderChild;
        onValueChange: (value: any) => void | Promise<void>;
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        /**
         * Returns the current content of the input field
         */
        abstract getValue(): any;
        /**
         * Sets the value on this input field, overriding the current content
         *
         * @param value
         */
        abstract setValue(value: any): void;
        /**
         * Checks if the value is the same as the value of this input field
         *
         * @param value
         */
        abstract isEqualValue(value: any): boolean;
        /**
         * Returns the default value of this input field
         */
        abstract getDefaultValue(): any;
        /**
         * Returns the HTML element this input field is wrapped in
         */
        abstract getHtmlElement(): HTMLElement;
        /**
         * Renders the input field as a child of the container
         *
         * @param container
         */
        abstract render(container: HTMLDivElement): void;
        abstract destroy(): void;
    }
}
declare module "inputFields/ToggleInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { ToggleComponent } from 'obsidian';
    export class ToggleInputField extends AbstractInputField {
        toggleComponent: ToggleComponent | undefined;
        getValue(): boolean;
        setValue(value: any): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): boolean;
        getHtmlElement(): HTMLElement;
        render(container: HTMLDivElement): void;
        destroy(): void;
    }
}
declare module "inputFields/TextInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { TextComponent } from 'obsidian';
    export class TextInputField extends AbstractInputField {
        textComponent: TextComponent | undefined;
        getValue(): string;
        setValue(value: any): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): any;
        getHtmlElement(): HTMLElement;
        render(container: HTMLDivElement): void;
        destroy(): void;
    }
}
declare module "utils/ParserUtils" {
    export class EnclosingPair {
        readonly openingEqualsClosing: boolean;
        private readonly _openingString;
        private readonly _closingString;
        constructor(openingString: string, closingString?: string);
        get openingString(): string;
        get closingString(): string;
        overlaps(other: EnclosingPair): boolean;
        equals(other: EnclosingPair): boolean;
        toString(): string;
    }
    export class ParserUtils {
        static split(str: string, separator: string, ignore?: EnclosingPair): string[];
        static removeInBetween(str: string, enclosingPair: EnclosingPair): string;
        static getInBetween(str: string, enclosingPair: EnclosingPair): string | string[];
        static isStringAt(str: string, subStr: string, index: number): boolean;
        static contains(str: string, subStr: string): boolean;
        static numberOfOccurrences(str: string, subStr: string): number;
    }
}
declare module "inputFieldArguments/AbstractInputFieldArgument" {
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export abstract class AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: any;
        requiresValue: boolean;
        allowMultiple: boolean;
        abstract parseValue(value: any): void;
        isAllowed(inputFieldType: InputFieldType): boolean;
        getAllowedInputFieldsAsString(): string;
    }
}
declare module "inputFieldArguments/ClassInputFieldArgument" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class ClassInputFieldArgument extends AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: string[];
        requiresValue: boolean;
        allowMultiple: boolean;
        parseValue(valueStr: string): void;
    }
}
declare module "inputFieldArguments/AddLabelsInputFieldArgument" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class AddLabelsInputFieldArgument extends AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: boolean;
        requiresValue: boolean;
        allowMultiple: boolean;
        parseValue(value: any): void;
    }
}
declare module "inputFieldArguments/MinValueInputFieldArgument" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class MinValueInputFieldArgument extends AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: number;
        requiresValue: boolean;
        allowMultiple: boolean;
        parseValue(valueStr: string): void;
    }
}
declare module "inputFieldArguments/MaxValueInputFieldArgument" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class MaxValueInputFieldArgument extends AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: number;
        requiresValue: boolean;
        allowMultiple: boolean;
        parseValue(valueStr: string): void;
    }
}
declare module "inputFieldArguments/OptionInputFieldArgument" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class OptionInputFieldArgument extends AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: string;
        requiresValue: boolean;
        allowMultiple: boolean;
        parseValue(valueStr: string): void;
    }
}
declare module "inputFieldArguments/TitleInputFieldArgument" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class TitleInputFieldArgument extends AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: string;
        requiresValue: boolean;
        allowMultiple: boolean;
        parseValue(valueStr: string): void;
    }
}
declare module "inputFieldArguments/AlignRightInputFieldArgument" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class AlignRightInputFieldArgument extends AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: boolean;
        requiresValue: boolean;
        allowMultiple: boolean;
        parseValue(valueStr: string): void;
    }
}
declare module "inputFieldArguments/OptionQueryInputFieldArgument" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class OptionQueryInputFieldArgument extends AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: string;
        requiresValue: boolean;
        allowMultiple: boolean;
        parseValue(valueStr: string): void;
    }
}
declare module "inputFieldArguments/ShowcaseInputFieldArgument" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { InputFieldArgumentType, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class ShowcaseInputFieldArgument extends AbstractInputFieldArgument {
        identifier: InputFieldArgumentType;
        allowedInputFields: InputFieldType[];
        value: boolean;
        requiresValue: boolean;
        allowMultiple: boolean;
        parseValue(valueStr: string): void;
    }
}
declare module "inputFieldArguments/InputFieldArgumentFactory" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    export class InputFieldArgumentFactory {
        static createInputFieldArgument(argumentIdentifier: string): AbstractInputFieldArgument;
    }
}
declare module "inputFieldArguments/InputFieldArgumentContainer" {
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    export class InputFieldArgumentContainer {
        arguments: AbstractInputFieldArgument[];
        add(argument: AbstractInputFieldArgument): void;
        validate(): void;
        /**
         * Merges two InputFieldArgumentContainers by overriding.
         * The arguments form the other container take priority.
         *
         * @param other
         */
        mergeByOverride(other: InputFieldArgumentContainer): InputFieldArgumentContainer;
        /**
         * Merges two InputFieldArgumentContainers.
         * If there is an argument that does not allow duplicates in both containers this will throw an error.
         *
         * @param other
         */
        mergeByThrow(other: InputFieldArgumentContainer): InputFieldArgumentContainer;
    }
}
declare module "parsers/InputFieldDeclarationParser" {
    import { EnclosingPair } from "utils/ParserUtils";
    import { InputFieldArgumentContainer } from "inputFieldArguments/InputFieldArgumentContainer";
    export enum InputFieldType {
        TOGGLE = "toggle",
        SLIDER = "slider",
        TEXT = "text",
        TEXT_AREA = "text_area",
        SELECT = "select",
        MULTI_SELECT = "multi_select",
        DATE = "date",
        TIME = "time",
        DATE_PICKER = "date_picker",
        NUMBER = "number",
        SUGGESTER = "suggester",
        EDITOR = "editor",
        IMAGE_SUGGESTER = "imageSuggester",
        INVALID = "invalid"
    }
    export enum InputFieldArgumentType {
        CLASS = "class",
        ADD_LABELS = "addLabels",
        MIN_VALUE = "minValue",
        MAX_VALUE = "maxValue",
        OPTION = "option",
        TITLE = "title",
        ALIGN_RIGHT = "alignRight",
        OPTION_QUERY = "optionQuery",
        SHOWCASE = "showcase",
        INVALID = "invalid"
    }
    export interface InputFieldDeclaration {
        /**
         * The full declaration of the input field including the "INPUT[]".
         * e.g.
         * INPUT[input_type(argument_name(value)):bind_target]
         */
        fullDeclaration?: string;
        /**
         * Trimmed declaration of the input field including without the "INPUT[]".
         * e.g.
         * input_type(argument_name(value)):bind_target
         */
        declaration?: string;
        /**
         * The type of the input field.
         * e.g.
         * input_type
         */
        inputFieldType: InputFieldType;
        /**
         * Whether the input field is bound.
         * e.g.
         * true
         */
        isBound: boolean;
        /**
         * The frontmatter field the input field is bound to.
         * e.g.
         * bind_target
         */
        bindTarget: string;
        /**
         * A collection of the input field arguments.
         */
        argumentContainer: InputFieldArgumentContainer;
        error?: Error | string;
    }
    export interface Template {
        identifier: string;
        template: InputFieldDeclaration;
    }
    export class InputFieldDeclarationParser {
        roundBracesPair: EnclosingPair;
        squareBracesPair: EnclosingPair;
        curlyBracesPair: EnclosingPair;
        allBracesPairs: EnclosingPair[];
        templates: Template[];
        parseDeclaration(declaration: InputFieldDeclaration, inputFieldArguments?: {
            type: InputFieldArgumentType;
            value: string;
        }[] | undefined, templateName?: string | undefined): InputFieldDeclaration;
        parseString(fullDeclaration: string): InputFieldDeclaration;
        parseTemplates(templates: string): void;
        parseArgumentString(inputFieldType: InputFieldType, inputFieldArgumentsString: string): InputFieldArgumentContainer;
        parseArguments(inputFieldType: InputFieldType, inputFieldArguments?: {
            type: InputFieldArgumentType;
            value: any;
        }[] | undefined): InputFieldArgumentContainer;
        extractInputFieldArgumentIdentifier(argumentString: string): string;
        extractInputFieldArgumentValue(argumentString: string): string;
        getInputFieldArgumentType(str: string): InputFieldArgumentType;
        getInputFieldType(str: string): InputFieldType;
        applyTemplate(inputFieldDeclaration: InputFieldDeclaration, templateName: string | null | undefined): void;
    }
}
declare module "inputFields/SliderInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { SliderComponent } from 'obsidian';
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    export class SliderInputField extends AbstractInputField {
        sliderComponent: SliderComponent | undefined;
        minValue: number;
        maxValue: number;
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        getValue(): number;
        setValue(value: any): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): any;
        getHtmlElement(): HTMLElement;
        render(container: HTMLDivElement): void;
        destroy(): void;
    }
}
declare module "inputFields/TextAreaInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { TextAreaComponent } from 'obsidian';
    export class TextAreaInputField extends AbstractInputField {
        textAreaComponent: TextAreaComponent | undefined;
        getValue(): string;
        setValue(value: any): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): any;
        getHtmlElement(): HTMLElement;
        render(container: HTMLDivElement): void;
        destroy(): void;
    }
}
declare module "inputFields/SelectInputFieldElement" {
    import { SelectInputField } from "inputFields/SelectInputField";
    export class SelectInputFieldElement {
        value: string;
        selectInputField: SelectInputField;
        readonly id: number;
        element: HTMLDivElement;
        cssClass: string;
        activeClass: string;
        hoverClass: string;
        private active;
        private highlighted;
        constructor(value: string, parentElement: HTMLElement, id: number, multiSelectInputField: SelectInputField, active?: boolean);
        getHTMLId(): string;
        isHighlighted(): boolean;
        setHighlighted(value: boolean): void;
        isActive(): boolean;
        setActive(active: boolean, updateParent?: boolean): void;
        update(updateParent: boolean): void;
        addClass(cssClass: string): void;
        removeClass(cssClass: string): void;
        render(): void;
    }
}
declare module "inputFields/SelectInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { SelectInputFieldElement } from "inputFields/SelectInputFieldElement";
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    export class SelectInputField extends AbstractInputField {
        static allowInline: boolean;
        elements: SelectInputFieldElement[];
        allowMultiSelect: boolean;
        container: HTMLDivElement | undefined;
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        getHtmlElement(): HTMLElement;
        getValue(): string;
        setValue(value: any): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): any;
        onChange(): void;
        render(container: HTMLDivElement): void;
        destroy(): void;
        disableAllOtherElements(elementId: number): void;
        deHighlightAllOtherElements(elementId: number): void;
        activateHighlighted(): void;
        highlightUp(): void;
        highlightDown(): void;
        private getNextSelectModalElement;
        private getPreviousSelectModalElement;
    }
}
declare module "inputFields/MultiSelectInputField" {
    import { SelectInputField } from "inputFields/SelectInputField";
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    export class MultiSelectInputField extends SelectInputField {
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        getValue(): any;
        setValue(value: string[]): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): string[];
    }
}
declare module "parsers/DateParser" {
    export class DateParser {
        static dateFormat: string;
        static stringify(date: moment.Moment): string;
        static parse(dateString: string): moment.Moment;
        static getDefaultDate(): moment.Moment;
        static getDefaultDay(): number;
        static getDefaultMonth(): number;
        static getDefaultYear(): number;
    }
}
declare module "inputFields/DateInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { DropdownComponent, TextComponent } from 'obsidian';
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    export class DateInputField extends AbstractInputField {
        container: HTMLDivElement | undefined;
        date: moment.Moment;
        months: Record<string, string>;
        days: Record<string, string>;
        monthComponent: DropdownComponent | undefined;
        dayComponent: DropdownComponent | undefined;
        yearComponent: TextComponent | undefined;
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        getHtmlElement(): HTMLElement;
        getValue(): string;
        setValue(value: string): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): any;
        render(container: HTMLDivElement): void;
        destroy(): void;
        private onMonthChange;
        private onDayChange;
        private onYearChange;
        private clampDay;
    }
}
declare module "parsers/TimeParser" {
    export class Time {
        private _hour;
        private _minute;
        constructor();
        getHour(): number;
        setHour(value: number): void;
        getMinute(): number;
        setMinute(value: number): void;
        getUniformHour(): string;
        getUniformMinute(): string;
        setHourFromString(str: string): void;
        setMinuteFromString(str: string): void;
    }
    export class TimeParser {
        static parse(timeString: string): Time | undefined;
        static stringify(time: Time): string;
        static getDefaultTime(): Time;
        static getDefaultHour(): number;
        static getDefaultMinute(): number;
    }
}
declare module "inputFields/TimeInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { DropdownComponent } from 'obsidian';
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    import { Time } from "parsers/TimeParser";
    export class TimeInputField extends AbstractInputField {
        container: HTMLDivElement | undefined;
        time: Time | undefined;
        hours: Record<string, string>;
        minutes: Record<string, string>;
        hourComponent: DropdownComponent | undefined;
        minuteComponent: DropdownComponent | undefined;
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        getHtmlElement(): HTMLElement;
        getValue(): string;
        setValue(value: string): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): string;
        render(container: HTMLDivElement): void;
        destroy(): void;
        private onHourChange;
        private onMinuteChange;
    }
}
declare module "inputFields/DatePicker/DatePickerModal" {
    import { App, Modal } from 'obsidian';
    import { DatePickerInputField } from "inputFields/DatePicker/DatePickerInputField";
    export class DatePickerModal extends Modal {
        opener: DatePickerInputField;
        constructor(app: App, opener: DatePickerInputField);
        onOpen(): void;
    }
}
declare module "inputFields/DatePicker/DatePickerInputField" {
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import DatePickerInput from './DatePickerInput.svelte';
    import { DatePickerModal } from "inputFields/DatePicker/DatePickerModal";
    import { Moment } from 'moment';
    export class DatePickerInputField extends AbstractInputField {
        container: HTMLDivElement | undefined;
        component: DatePickerInput | undefined;
        modal: DatePickerModal | undefined;
        date: moment.Moment;
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        getValue(): any;
        setValue(value: any): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): any;
        getHtmlElement(): HTMLElement;
        datePickerValueChanged(date: Moment): void;
        showDatePicker(): void;
        render(container: HTMLDivElement): void;
        destroy(): void;
    }
}
declare module "inputFields/NumberInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { TextComponent } from 'obsidian';
    export class NumberInputField extends AbstractInputField {
        numberComponent: TextComponent | undefined;
        getValue(): number;
        setValue(value: any): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): any;
        getHtmlElement(): HTMLElement;
        render(container: HTMLDivElement): void;
        destroy(): void;
    }
}
declare module "inputFields/Suggest/SuggestInputModal" {
    import { App, FuzzySuggestModal } from 'obsidian';
    import { SuggestOption } from "inputFields/Suggest/SuggestInputField";
    export class SuggestInputModal extends FuzzySuggestModal<SuggestOption> {
        options: SuggestOption[];
        onSelect: (item: SuggestOption) => void;
        constructor(app: App, options: SuggestOption[], onSelect: (item: SuggestOption) => void);
        getItemText(item: SuggestOption): string;
        getItems(): SuggestOption[];
        onChooseItem(item: SuggestOption, evt: MouseEvent | KeyboardEvent): void;
    }
}
declare module "inputFields/Suggest/SuggestInputField" {
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import SuggestInput from './SuggestInput.svelte';
    export interface SuggestOption {
        value: string;
        displayValue: string;
    }
    export class SuggestInputField extends AbstractInputField {
        container: HTMLDivElement | undefined;
        component: SuggestInput | undefined;
        value: string;
        options: SuggestOption[];
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        getValue(): string;
        setValue(value: any): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): any;
        getHtmlElement(): HTMLElement;
        needsDataview(): boolean;
        getOptions(): Promise<void>;
        showSuggest(): Promise<void>;
        render(container: HTMLDivElement): void;
        destroy(): void;
    }
}
declare module "inputFields/Editor/EditorInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import EditorInput from './EditorInput.svelte';
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    export class EditorInputField extends AbstractInputField {
        static allowInlineCodeBlock: boolean;
        container: HTMLDivElement | undefined;
        component: EditorInput | undefined;
        value: string;
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        getValue(): string;
        setValue(value: any): void;
        isEqualValue(value: any): boolean;
        getDefaultValue(): any;
        getHtmlElement(): HTMLElement;
        render(container: HTMLDivElement): void;
        destroy(): void;
    }
}
declare module "inputFields/ImageSuggest/ImageSuggestModal" {
    import { App, Modal } from 'obsidian';
    export class ImageSuggestModal extends Modal {
        options: string[];
        onSelect: (item: string) => void;
        constructor(app: App, options: string[], onSelect: (item: string) => void);
        onOpen(): void;
    }
}
declare module "inputFields/ImageSuggest/ImageSuggestInputField" {
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import ImageSuggestInput from './ImageSuggestInput.svelte';
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    export class ImageSuggestInputField extends AbstractInputField {
        static allowInline: boolean;
        container: HTMLDivElement | undefined;
        component: ImageSuggestInput | undefined;
        value: string;
        options: string[];
        constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild);
        getValue(): string;
        setValue(value: string): void;
        isEqualValue(value: string): boolean;
        getDefaultValue(): any;
        getHtmlElement(): HTMLElement;
        isImageExtension(extension: string): boolean;
        getOptions(): Promise<void>;
        showSuggest(): Promise<void>;
        render(container: HTMLDivElement): void;
        destroy(): void;
    }
}
declare module "inputFields/InputFieldFactory" {
    import { InputFieldMarkdownRenderChild, RenderChildType } from "InputFieldMarkdownRenderChild";
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { InputFieldType } from "parsers/InputFieldDeclarationParser";
    import MetaBindPlugin from "main";
    export class InputFieldFactory {
        static allowCodeBlockMap: Record<string, {
            block: boolean;
            inline: boolean;
        }>;
        static createInputField(inputFieldType: InputFieldType, args: {
            renderChildType: RenderChildType;
            inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild;
        }): AbstractInputField | undefined;
        static checkRenderChildTypeAllowed(inputFieldType: InputFieldType, renderChildType: RenderChildType, plugin: MetaBindPlugin): void;
    }
}
declare module "utils/Signal" {
    export interface NotifierInterface<T, L extends Listener<T>> {
        registerListener(listener: Omit<L, 'uuid'>): L;
        unregisterListener(listener: L): void;
        unregisterListenerById(listenerId: string): void;
        notifyListeners(value: T): void;
    }
    export class Notifier<T, L extends Listener<T>> implements NotifierInterface<T, Listener<T>> {
        listeners: L[];
        constructor();
        registerListener(listener: Omit<L, 'uuid'>): L;
        unregisterListener(listener: L): void;
        unregisterListenerById(listenerId: string): void;
        notifyListeners(value: T): void;
    }
    export interface Listener<T> {
        uuid: string;
        callback: ListenerCallback<T>;
    }
    export type ListenerCallback<T> = (value: T) => void;
    export class Signal<T> extends Notifier<T, Listener<T>> {
        value: T;
        constructor(value: T);
        get(): T;
        set(value: T): void;
    }
}
declare module "MetadataManager" {
    import { CachedMetadata, TFile } from 'obsidian';
    import MetaBindPlugin from "main";
    import { Listener, Signal } from "utils/Signal";
    export interface MetadataFileCacheListener extends Listener<any | undefined> {
        metadataPath: string[];
    }
    export interface MetadataFileCache {
        file: TFile;
        metadata: Record<string, any>;
        listeners: MetadataFileCacheListener[];
        cyclesSinceLastUpdate: number;
        changed: boolean;
    }
    export class MetadataManager {
        cache: MetadataFileCache[];
        plugin: MetaBindPlugin;
        updateCycleThreshold: number;
        interval: number | undefined;
        constructor(plugin: MetaBindPlugin);
        register(file: TFile, signal: Signal<any | undefined>, metadataPath: string[], uuid: string): MetadataFileCache;
        unregister(file: TFile, uuid: string): void;
        getCacheForFile(file: TFile): MetadataFileCache | undefined;
        private update;
        updateFrontmatter(fileCache: MetadataFileCache): Promise<void>;
        updateMetadataFileCache(metadata: Record<string, any>, file: TFile, uuid?: string | undefined): void;
        updatePropertyInMetadataFileCache(value: any, pathParts: string[], file: TFile, uuid?: string | undefined): void;
        updateMetadataFileCacheOnFrontmatterUpdate(file: TFile, data: string, cache: CachedMetadata): void;
        notifyListeners(fileCache: MetadataFileCache, metadataPath?: string[] | undefined, exceptUuid?: string | undefined): void;
    }
}
declare module "InputFieldMarkdownRenderChild" {
    import { MarkdownRenderChild, TFile } from 'obsidian';
    import MetaBindPlugin from "main";
    import { AbstractInputField } from "inputFields/AbstractInputField";
    import { InputFieldArgumentType, InputFieldDeclaration } from "parsers/InputFieldDeclarationParser";
    import { AbstractInputFieldArgument } from "inputFieldArguments/AbstractInputFieldArgument";
    import { MetadataFileCache } from "MetadataManager";
    import { Signal } from "utils/Signal";
    export enum RenderChildType {
        INLINE = "inline",
        BLOCK = "block"
    }
    export class InputFieldMarkdownRenderChild extends MarkdownRenderChild {
        plugin: MetaBindPlugin;
        metadataCache: MetadataFileCache | undefined;
        filePath: string;
        uuid: string;
        inputField: AbstractInputField | undefined;
        error: string;
        renderChildType: RenderChildType;
        fullDeclaration?: string;
        inputFieldDeclaration: InputFieldDeclaration;
        bindTargetFile: TFile | undefined;
        bindTargetMetadataPath: string[] | undefined;
        private metadataManagerReadSignalListener;
        /**
         * Signal to write to the input field
         */
        writeSignal: Signal<any>;
        /**
         * Signal to read from the input field
         */
        readSignal: Signal<any>;
        constructor(containerEl: HTMLElement, renderChildType: RenderChildType, declaration: InputFieldDeclaration, plugin: MetaBindPlugin, filePath: string, uuid: string);
        parseBindTarget(): void;
        registerSelfToMetadataManager(): MetadataFileCache | undefined;
        unregisterSelfFromMetadataManager(): void;
        updateMetadataManager(value: any): void;
        getInitialValue(): any | undefined;
        getArguments(name: InputFieldArgumentType): AbstractInputFieldArgument[];
        getArgument(name: InputFieldArgumentType): AbstractInputFieldArgument | undefined;
        addCardContainer(): boolean;
        hasValidBindTarget(): boolean;
        onload(): Promise<void>;
        renderError(message: string): void;
        onunload(): void;
    }
}
declare module "ScriptMarkdownRenderChild" {
    import { MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';
    import MetaBindPlugin from "main";
    export class ScriptMarkdownRenderChild extends MarkdownRenderChild {
        content: string;
        ctx: MarkdownPostProcessorContext;
        plugin: MetaBindPlugin;
        constructor(containerEl: HTMLElement, content: string, ctx: MarkdownPostProcessorContext, plugin: MetaBindPlugin);
        tryRun(): Promise<void>;
        onload(): Promise<void>;
    }
}
declare module "main" {
    import { Plugin, TFile } from 'obsidian';
    import { MetaBindPluginSettings } from "settings/Settings";
    import { InputFieldMarkdownRenderChild } from "InputFieldMarkdownRenderChild";
    import { MetadataManager } from "MetadataManager";
    import { API } from "API";
    import { Extension } from '@codemirror/state';
    import './frontmatterDisplay/custom_overlay';
    export default class MetaBindPlugin extends Plugin {
        settings: MetaBindPluginSettings;
        activeMarkdownInputFields: InputFieldMarkdownRenderChild[];
        metadataManager: MetadataManager;
        api: API;
        editorExtensions: Extension[];
        onload(): Promise<void>;
        /**
         * Inspired by https://github.com/SilentVoid13/Templater/blob/487805b5ad1fd7fbc145040ed82b4c41fc2c48e2/src/editor/Editor.ts#L67
         */
        registerCodeMirrorMode(): Promise<void>;
        onunload(): void;
        registerInputFieldMarkdownRenderChild(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild): void;
        unregisterInputFieldMarkdownRenderChild(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild): void;
        getFilesByName(name: string): TFile[];
        loadSettings(): Promise<void>;
        saveSettings(): Promise<void>;
    }
}
declare module "InlineAPI" {
    import { API } from "API";
    import { InputFieldArgumentType, InputFieldDeclaration, InputFieldType } from "parsers/InputFieldDeclarationParser";
    import { InputFieldMarkdownRenderChild, RenderChildType } from "InputFieldMarkdownRenderChild";
    export class InlineAPI {
        api: API;
        filePath: string;
        container?: HTMLElement;
        constructor(api: API, filePath: string, container?: HTMLElement);
        createInputField(declaration: InputFieldDeclaration, templateName: string | undefined, renderType: RenderChildType): InputFieldMarkdownRenderChild;
        createInputFieldInContainer(declaration: InputFieldDeclaration, templateName: string | undefined, renderChildType: RenderChildType, container: HTMLElement): InputFieldMarkdownRenderChild;
        createInputFieldFromString(fullDeclaration: string, renderType: RenderChildType, filePath: string): InputFieldMarkdownRenderChild;
        createInputFieldFromStringInContainer(fullDeclaration: string, renderType: RenderChildType, filePath: string, container: HTMLElement): InputFieldMarkdownRenderChild;
        createDeclaration(inputFieldType: InputFieldType, inputFieldArguments?: {
            type: InputFieldArgumentType;
            value: string;
        }[]): InputFieldDeclaration;
        createDeclarationFromString(fullDeclaration: string): InputFieldDeclaration;
        bindDeclaration(declaration: InputFieldDeclaration, bindTargetField: string, bindTargetFile?: string): InputFieldDeclaration;
    }
}
declare module "API" {
    import { App } from 'obsidian';
    import MetaBindPlugin from "main";
    import { InlineAPI } from "InlineAPI";
    import { InputFieldMarkdownRenderChild, RenderChildType } from "InputFieldMarkdownRenderChild";
    import { InputFieldArgumentType, InputFieldDeclaration, InputFieldDeclarationParser, InputFieldType } from "parsers/InputFieldDeclarationParser";
    export class API {
        app: App;
        plugin: MetaBindPlugin;
        parser: InputFieldDeclarationParser;
        constructor(plugin: MetaBindPlugin);
        createInlineAPI(filePath: string, container?: HTMLElement): InlineAPI;
        createInputField(declaration: InputFieldDeclaration, templateName: string | undefined, renderChildType: RenderChildType, filePath: string, container: HTMLElement): InputFieldMarkdownRenderChild;
        createInputFieldFromString(fullDeclaration: string, renderType: RenderChildType, filePath: string, container: HTMLElement): InputFieldMarkdownRenderChild;
        createDeclaration(inputFieldType: InputFieldType, inputFieldArguments?: {
            type: InputFieldArgumentType;
            value: string;
        }[]): InputFieldDeclaration;
        createDeclarationFromString(fullDeclaration: string): InputFieldDeclaration;
        bindDeclaration(declaration: InputFieldDeclaration, bindTargetField: string, bindTargetFile?: string): InputFieldDeclaration;
    }
}
declare module "frontmatterDisplay/FrontmatterWidget" {
    import { EditorView, WidgetType } from '@codemirror/view';
    export class FrontmatterWidget extends WidgetType {
        toDOM(view: EditorView): HTMLElement;
    }
}
declare module "frontmatterDisplay/CmPlugin" {
    import { DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
    class CmPlugin implements PluginValue {
        decorations: DecorationSet;
        constructor(view: EditorView);
        update(update: ViewUpdate): void;
        destroy(): void;
        buildDecorations(view: EditorView): DecorationSet;
    }
    export const cmPlugin: ViewPlugin<CmPlugin>;
}
declare module "imputFieldManager/AbstractInputFieldManager" { }
declare module "parsers/MarkdownLinkParser" {
    export interface MarkdownLink {
        isEmbed: boolean;
        target: string;
        block: string;
        alias: string;
    }
    export function parseMdLink(link: string): MarkdownLink;
    export function isMdLink(str: string): boolean;
}
