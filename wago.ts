// // Gib deinen Code hier ein

//% block
enum PlayerMode {
    Start,
    Maus,
    Elefant,
    Ende
}

enum GameEvent {
    A,
    B,
    AB,
    WireTouch,
    WireLoose,
    DestinationTouch
}

//% color=#6EC800
//% block="Maus Heiße Bahn"
namespace MausHeisseBahn {
    let player: PlayerMode = PlayerMode.Start;
    let eventQueue: GameEvent[] = [];
    let timeMaus: number = 0;
    let timeElefant: number = 0;

    let on_start_handler: () => void = () => { };
    let on_maus_handler: () => void = () => { };
    let on_elefant_handler: () => void = () => { };
    let on_ende_handler: () => void = () => { };


    function init() {
        player = PlayerMode.Start;
        eventQueue = [];
        timeMaus = 0;
        timeElefant = 0;
    }

    //% block
    export function current_player_text() {
        switch (player) {
            case PlayerMode.Start:
                return "Wer soll anfangen?"
            case PlayerMode.Maus:
                return "Maus"
            case PlayerMode.Elefant:
                return "Elefant"
            case PlayerMode.Ende:
                return "Sieger steht fest"
        }
    }

    //% block
    export function current_player() {
        return player;
    }

    //% block
    export function event_queue() {
        return "" + eventQueue;
    }

    //% block="Die Maus fängt an"
    export function maus_zuerst() {
        eventQueue.push(GameEvent.A)
    }

    //% block="Der Elefant fängt an"
    export function elefant_zuerst() {
        eventQueue.push(GameEvent.B)
    }

    //% block="Reset"
    export function reset() {
        eventQueue.push(GameEvent.AB)
    }

    //% block
    export function on_start(a: () => void) {
        on_start_handler = a
    }

    //% block
    export function on_maus(a: () => void) {
        on_maus_handler = a
    }

    //% block
    export function on_elefant(a: () => void) {
        on_elefant_handler = a
    }

    //% block
    export function on_ende(a: () => void) {
        on_ende_handler = a
    }

    control.runInBackground(() => {
        let e: GameEvent | undefined = undefined;
        while (true) {
            switch (player) {
                case PlayerMode.Start:
                    on_start_handler();
                    break;
                case PlayerMode.Maus:
                    on_maus_handler();
                    break;
                case PlayerMode.Elefant:
                    on_elefant_handler();
                    break;
                case PlayerMode.Ende:
                    on_ende_handler();
                    break;
            }
            while (typeof (e = eventQueue.shift()) !== "undefined") {
                switch (player) {
                    case PlayerMode.Start:
                        switch (e) {
                            case GameEvent.A:
                                player = PlayerMode.Maus;
                                break;
                            case GameEvent.B:
                                player = PlayerMode.Elefant;
                                break;
                            case GameEvent.AB:
                                player = PlayerMode.Start;
                        }
                        break;
                    case PlayerMode.Maus:
                        switch (e) {
                            case GameEvent.B:
                                player = PlayerMode.Elefant;
                                break;
                            case GameEvent.AB:
                                player = PlayerMode.Start;
                        }
                        break;
                    case PlayerMode.Elefant:
                        switch (e) {
                            case GameEvent.A:
                                player = PlayerMode.Maus;
                                break;
                            case GameEvent.AB:
                                player = PlayerMode.Start;
                        }
                        break;
                    case PlayerMode.Ende:
                        switch (e) {
                            case GameEvent.AB:
                                player = PlayerMode.Start;
                        }
                        break;
                }
            }
            basic.pause(100)
        }
    })
}
