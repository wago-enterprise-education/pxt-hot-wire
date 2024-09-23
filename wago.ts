// Gib deinen Code hier ein
/**
 * Use the "fixedInstance" macro to create a 
 * set number of instances for a given class.
 */

enum PlayerMode {
    Start,
    Maus,
    Elefant,
    Ende
}

//% fixedInstances
//% blockNamespace=WAGO
class HotWireGame {
    public value: number;
    public player: PlayerMode;
    public before_start: { (): void; };
    public on_finish: { (): void; };

    constructor() {
        this.value = 0;
        this.player = PlayerMode.Start;
    }
}

//% color=#6ec800
namespace WAGO {
    //% fixedInstance whenUsed
    export const game = new HotWireGame();

    function _gameloop() {
        basic.clearScreen()
        for (let x=0; x<5; ++x) {
            for (let y=0; y<5; ++y) {
                let d = x*5+y;
                let mask = 1 << d;
                if ((game.value & mask) >= 1) led.plot(x,y);
            }
        }
        // basic.showNumber(game.value);
        basic.pause(100);
        game.value += 1;
    }

    control.runInParallel(() => {
        let start = 0;
        while (true) {
            start = control.millis();
            _gameloop();
            pause(Math.max(0, 100 - (control.millis() - start)));
        }
    });

    //% block
    export function set_before_start(a: () => void): void {
        game.before_start = a;
    }
    //% block="Increment value"
    export function inc() {
        game.before_start();
        game.value += 1;
    }
    //% block
    export function decrement(): void {
        game.value -= 1;
    }
    //% block
    export function value(): number {
        return game.value;
    }
    //% block
    export function game_loop() {
        basic.showNumber(game.value);
        basic.pause(100);
        game.value += 1;
    }
}


// //% color="#6EC800" weight=100
// namespace WAGO {
//     //% block 
//     export function helloWagoWorld(x: number) {

//     }

//     // note that Caml casing yields lower case
//     // block text with spaces

//     //% weight=45 blockAllowMultiple=1
//     //% interval.shadow=longTimePicker
//     //% afterOnStart=true
//     //% block="Hot Wire Game"
//     export function everyInterval(on_start: () => void, a: () => void): void {
//         control.runInParallel(() => {
//             let start = 0;
//             on_start();
//             while (true) {
//                 start = control.millis();
//                 a();
//                 pause(Math.max(0, 100 - (control.millis() - start)));
//             }
//         });
//     }

//     //% block
//     export function ledson() {
//         basic.setLedColors(0xff0000, 0xff0000, 0xff0000)
//     }
// }
