import { Component, computed, forwardRef, input, signal } from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
} from '@angular/forms';

@Component({
    selector: 'app-chips-input',
    imports: [],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ChipsInput),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => ChipsInput),
            multi: true,
        },
    ],
    templateUrl: './chips-input.html',
    styleUrl: './chips-input.css',
})
export class ChipsInput implements ControlValueAccessor, Validator {
    required = input(false);
    minChips = input(0);
    maxChips = input<number | null>(null);
    maxChipLength = input(60);
    placeholder = input('Type and press Enter');
    emptyHint = input('No items added yet.');

    readonly chips = signal<string[]>([]);
    readonly newChip = signal('');
    readonly isDisabled = signal(false);

    readonly errorMessage = computed(() => {
        const count = this.chips().length;
        const max = this.maxChips();

        if (this.required() && count === 0) return 'Add at least one item.';
        if (this.minChips() > 0 && count < this.minChips()) {
            return `Add at least ${this.minChips()} items.`;
        }
        if (max !== null && count > max) {
            return `You can add up to ${max} items.`;
        }
        if (this.chips().some((chip) => chip.length > this.maxChipLength())) {
            return `Each item must be ${this.maxChipLength()} characters or less.`;
        }

        return null;
    });

    private onChange: (value: string[]) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string[] | null): void {
        this.chips.set(value ?? []);
    }

    registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }

    validate(): ValidationErrors | null {
        const count = this.chips().length;
        const max = this.maxChips();

        if (this.required() && count === 0) return { requiredChips: true };
        if (this.minChips() > 0 && count < this.minChips()) {
            return { minChips: { required: this.minChips(), actual: count } };
        }
        if (max !== null && count > max) {
            return { maxChips: { max, actual: count } };
        }
        if (this.chips().some((chip) => chip.length > this.maxChipLength())) {
            return { maxChipLength: { maxLength: this.maxChipLength() } };
        }

        return null;
    }

    onInput(event: Event): void {
        this.newChip.set((event.target as HTMLInputElement).value);
    }

    addChip(): void {
        const value = this.newChip().trim();
        if (!value || value.length > this.maxChipLength()) return;

        this.onTouched();
        this.chips.update((chips) => [...chips, value]);
        this.onChange(this.chips());
        this.newChip.set('');
    }

    removeChip(index: number): void {
        this.onTouched();
        this.chips.update((chips) => chips.filter((_, i) => i !== index));
        this.onChange(this.chips());
    }
}