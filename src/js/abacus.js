/**
 * そろばんの珠を管理するクラス。
 */
export class Abacus {
    constructor(n = 0) {
        this.digits = Array(String(n).length).fill(AbacusDigit.getInstance());
        this.value = 0;
        this.carry = 0;
        this.add(n);
    }

    updateBeads(num) {
        const numArr = String(num).split('').map((d) => {
            return Number(d);
        });
        for (let i = numArr.length - 1; i >= 0; i--) {
            const d = numArr.shift();
            if (d === 0) {
                continue;
            }

            if (this.digits[i] === undefined) {
                this.digits[i] = AbacusDigit.getInstance();
            }

            const beforeDigit = Object.assign({}, this.digits[i]);
            let newVal = this.digits[i].value + d;
            if (newVal >= 10) {
                newVal -= 10;
                this.updateBeads(Math.pow(10, i + 1));
                this.carry++;
            }
            this.digits[i] = new AbacusDigit(newVal, Math.floor(newVal / 5), newVal % 5);
            if ((this.digits[i].five - beforeDigit.five) * (this.digits[i].one - beforeDigit.one) < 0) {
                this.carry++;
            }
        }
    }

    add(num) {
        this.updateBeads(num);
        this.value += num;
        return this;
    }
}

export class AbacusDigit {
    constructor(value = 0, five = 0, one = 0) {
        this.value = value;
        this.five = five;
        this.one = one;
    }

    static getInstance() {
        return new AbacusDigit();
    }
}
