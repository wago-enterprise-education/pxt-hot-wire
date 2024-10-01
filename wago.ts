//% block
enum GameStatus {
    //% block="Warte auf Spielstart"
    WaitForStart,
    //% block="Bahn berührt"
    Touched,
    //% block="Bahn verlassen"
    Dropped,
    //% block="Ziel erreicht"
    Finished
}

//% weight=100 color=#6ec800
namespace WAGO {
    let game_id = 0

    pins.setPull(DigitalPin.P0, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P1, PinPullMode.PullUp)

    export class Game {
        public id: number
        public status: GameStatus
        public time: number
        public start_time: number
        public enter_handler: { [key: number]: () => void; } = {}
        // public on_handler: { [key: number]: () => void; } = {}
        public exit_handler: { [key: number]: () => void; } = {}

        constructor() {
            this.id = game_id
            game_id++
            this.reset()

            this.enter_handler[GameStatus.WaitForStart] = () => {
                // basic.showNumber(this.id)
                basic.setLedColor(0xffffff)
            }
            this.enter_handler[GameStatus.Touched] = () => {
                // basic.showNumber(this.id)
                basic.setLedColor(0x00ff00)
            }
            this.enter_handler[GameStatus.Dropped] = () => {
                // basic.showNumber(this.id)
                basic.setLedColor(0xff0000)
                music.playTone(Note.C, music.beat(BeatFraction.Quarter))
            }
            this.enter_handler[GameStatus.Finished] = () => {
                // basic.showNumber(this.id)
                basic.setLedColor(0x0000ff)
            }

            // this.on_handler[GameStatus.WaitForStart] = () => {}
            // this.on_handler[GameStatus.Touched] = () => { }
            // this.on_handler[GameStatus.Dropped] = () => { }
            // this.on_handler[GameStatus.Finished] = () => {
            //     // basic.showNumber(this.time / 1000)
            //     // basic.pause(100)
            // }

            this.exit_handler[GameStatus.WaitForStart] = () => { }
            this.exit_handler[GameStatus.Touched] = () => { }
            this.exit_handler[GameStatus.Dropped] = () => { }
            this.exit_handler[GameStatus.Finished] = () => { }
        }

        //% block="Setze $this zurück"
        //% this.defl=Spiel
        //% this.shadow=variables_get
        reset() {
            this.status = GameStatus.WaitForStart
            this.time = 0
            this.start_time = 0
        }

        //% block="Zeit von $this"
        //% this.defl=Spiel
        //% this.shadow=variables_get
        get ergebnis() {
            return this.time / 1000
        }

        //% block="Zeige Zeit von $this"
        //% this.defl=Spiel
        //% this.shadow=variables_get
        public zeige_zeit() {
            for (let x = 0; x <= 4; x++) {
                for (let y = 0; y <= 4; y++) {
                    if ((y * 5 + x) * 5 < this.ergebnis) {
                        led.plot(x, y)
                    } else {
                        led.unplot(x, y)
                    }
                }
            }
        }

        //% block="Strafzeit von $seconds für $this"
        //% this.defl=Spiel
        //% this.shadow=variables_get
        public setze_strafzeit(seconds: number) {
            this.time += seconds * 1000
        }

        //% block="Spiel $this beendet"
        //% this.defl=Spiel
        //% this.shadow=variables_get
        get finished() {
            return this.status == GameStatus.Finished
        }

        //% block="$this: beim Start von $status"
        //% this.defl=Spiel
        //% this.shadow=variables_get
        //% handlerStatement
        set_enter_handler(status: GameStatus, a: () => void) {
            this.enter_handler[status] = a
        }

        // //% block="$this: während $status"
        // //% this.defl=Spiel
        // //% this.shadow=variables_get
        // //% handlerStatement
        // set_on_handler(status: GameStatus, a: () => void) {
        //     this.on_handler[status] = a
        // }

        //% block="$this: zum Ende von $status"
        //% this.defl=Spiel
        //% this.shadow=variables_get
        //% handlerStatement
        set_exit_handler(status: GameStatus, a: () => void) {
            this.exit_handler[status] = a
        }
    }

    let currentGame: Game | undefined = undefined

    //% block="neues Spiel"
    //% blockSetVariable=Spiel
    export function createGame(): Game {
        return new Game()
    }

    //% block="Aktiviere Spiel $game"
    //% game.defl=Spiel
    //% game.shadow=variables_get
    export function activate(game: Game) {
        if (currentGame != undefined) {
            if ((currentGame.status == GameStatus.Touched) || (currentGame.status == GameStatus.Dropped)) {
                return
            }
            currentGame.exit_handler[currentGame.status]()
        }
        currentGame = game
        currentGame.enter_handler[currentGame.status]()
    }

    //% block="Deaktiviere Spiele"
    export function activate_none() {
        if (currentGame != undefined) {
            if ((currentGame.status == GameStatus.Touched) || (currentGame.status == GameStatus.Dropped)) {
                return
            }
            currentGame.exit_handler[currentGame.status]()
        }
        currentGame = undefined
    }

    basic.forever(() => on_status())

    function on_status() {
        if (currentGame != undefined) {
            let new_status = currentGame.status
            let new_time = control.millis()
            let Ziel = pins.digitalReadPin(DigitalPin.P0)
            let Start = pins.digitalReadPin(DigitalPin.P1)
            // currentGame.on_handler[currentGame.status]()
            switch (currentGame.status) {
                case GameStatus.WaitForStart:
                    if (Start == 0) {
                        new_status = GameStatus.Touched
                    }
                    break
                case GameStatus.Touched:
                    currentGame.time = currentGame.time + new_time - currentGame.start_time
                    if (Start == 1) {
                        new_status = GameStatus.Dropped
                    }
                    if (Ziel == 0) {
                        new_status = GameStatus.Finished
                    }
                    break
                case GameStatus.Dropped:
                    if (Start == 0) {
                        new_status = GameStatus.Touched
                    }
                    if (Ziel == 0) {
                        new_status = GameStatus.Finished
                    }
                    break
                case GameStatus.Finished:
                    break
            }
            if (currentGame.status != new_status) {
                currentGame.exit_handler[currentGame.status]()
                currentGame.status = new_status
                currentGame.enter_handler[currentGame.status]()
            }
            currentGame.start_time = new_time
            basic.pause(20)
        }
    }
}
