/**
 * そろばんの珠を管理するクラス。
 */
export class Abacus {
    get carry(): number {
        return this._carry;
    }

    get value(): number {
        return this._value;
    }

    private readonly _digits: AbacusDigit[];
    private _value: number;
    private _carry: number;

    constructor(n = 0) {
        this._digits = Array(String(n).length).fill(new AbacusDigit());
        this._value = 0;
        this._carry = 0;
        this.add(n);
    }

    private updateBeads(num: number) {
        const numArr = String(num).split('').map((d) => {
            return Number(d);
        });
        for (let i = numArr.length - 1; i >= 0; i--) {
            const d = numArr.shift();
            if (d === undefined) {
                throw new Error('wrong add number to abacus')
            }
            if (d === 0) {
                continue;
            }

            if (this._digits[i] === undefined) {
                this._digits[i] = new AbacusDigit();
            }

            const beforeDigit = AbacusDigit.deepCopy(this._digits[i]);
            let newVal = this._digits[i].value + d;
            if (newVal >= 10) {
                newVal -= 10;
                this.updateBeads(Math.pow(10, i + 1));
                this._carry++;
            }
            this._digits[i] = new AbacusDigit(newVal, Math.floor(newVal / 5), newVal % 5);
            if ((this._digits[i].five - beforeDigit.five) * (this._digits[i].one - beforeDigit.one) < 0) {
                this._carry++;
            }
        }
    }

    add(num: number) {
        this.updateBeads(num);
        this._value += num;
        return this;
    }
}

export class AbacusDigit {
    get one(): number {
        return this._one;
    }

    get five(): number {
        return this._five;
    }

    get value(): number {
        return this._value;
    }

    private readonly _value: number;
    private readonly _five: number;
    private readonly _one: number;

    constructor(value = 0, five = 0, one = 0) {
        this._value = value;
        this._five = five;
        this._one = one;
    }

    static deepCopy(abacusDigit: AbacusDigit) {
        return new AbacusDigit(abacusDigit.value, abacusDigit.five, abacusDigit.one);
    }
}
