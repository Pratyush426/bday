import { Minigame, TicTacToe, RidhiQuiz, GuessThePerson, BestBrotherGame, RidhimaAcrostic } from './Minigames';

export class GameModal {
    private static instance: GameModal;
    private overlay: HTMLElement;
    private content: HTMLElement;
    private currentMinigame: Minigame | null = null;
    private games: (new () => Minigame)[] = [GuessThePerson, RidhimaAcrostic, BestBrotherGame, TicTacToe, RidhiQuiz];
    private currentGameIndex = 0;

    private constructor() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'game-modal-overlay';
        
        this.overlay.innerHTML = `
            <div class="game-modal-container">
                <button class="game-modal-close" id="game-modal-close">×</button>
                <div class="game-content" id="game-modal-content"></div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        this.content = this.overlay.querySelector('#game-modal-content') as HTMLElement;
        
        const closeBtn = this.overlay.querySelector('#game-modal-close');
        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });
        
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    }

    public static getInstance(): GameModal {
        if (!GameModal.instance) GameModal.instance = new GameModal();
        return GameModal.instance;
    }

    public open(gameIndex?: number) {
        this.overlay.classList.add('active');
        this.loadGame(gameIndex);
    }

    public close() {
        this.overlay.classList.remove('active');
        if (this.currentMinigame?.destroy) this.currentMinigame.destroy();
        this.currentMinigame = null;
    }

    private loadGame(gameIndex?: number) {
        if (gameIndex !== undefined) {
            this.currentGameIndex = gameIndex % this.games.length;
        }

        const GameClass = this.games[this.currentGameIndex];
        this.currentMinigame = new GameClass();
        this.currentMinigame.render(this.content);
        
        // Only increment if no specific index was provided
        if (gameIndex === undefined) {
            this.currentGameIndex = (this.currentGameIndex + 1) % this.games.length;
        }
    }
}

export function openGameModal(gameIndex?: number) {
    GameModal.getInstance().open(gameIndex);
}
