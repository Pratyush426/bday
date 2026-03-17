export interface Minigame {
    name: string;
    render: (container: HTMLElement) => void;
    destroy?: () => void;
}

export class TicTacToe implements Minigame {
    name = "Ridhi's X vs O";
    private board: (string | null)[] = Array(9).fill(null);
    private currentPlayer: 'X' | 'O' = 'X';
    private container: HTMLElement | null = null;

    render(container: HTMLElement) {
        this.container = container;
        container.innerHTML = `
            <h3 style="margin-bottom: 0.5rem; font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem;">${this.name}</h3>
            <div class="ttt-grid">
                ${Array(9).fill(0).map((_, i) => `<div class="ttt-cell" data-index="${i}"></div>`).join('')}
            </div>
            <div id="ttt-status" style="margin-top: 1rem; font-weight: bold; font-size: 1.2rem;">Player X's Turn</div>
            <button class="quirky-btn primary mt-3" id="ttt-reset" style="padding: 10px 20px;">Reset Game</button>
        `;

        const cells = container.querySelectorAll('.ttt-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleMove(cell as HTMLElement);
            });
        });

        const resetBtn = container.querySelector('#ttt-reset');
        resetBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.reset();
        });
    }

    private handleMove(cell: HTMLElement) {
        const index = parseInt(cell.getAttribute('data-index') || '0');
        if (this.board[index] || this.checkWinner()) return;

        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());

        const winner = this.checkWinner();
        const status = this.container?.querySelector('#ttt-status');

        if (winner) {
            if (status) status.textContent = winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins! 🎉`;
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            if (status) status.textContent = `Player ${this.currentPlayer}'s Turn`;
            
            if (this.currentPlayer === 'O') {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }

    private makeAIMove() {
        if (this.checkWinner()) return;
        const availableMoves = this.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
        if (availableMoves.length === 0) return;

        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        const cell = this.container?.querySelector(`.ttt-cell[data-index="${randomMove}"]`) as HTMLElement;
        if (cell) this.handleMove(cell);
    }

    private checkWinner() {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (const [a, b, c] of lines) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) return this.board[a];
        }
        if (!this.board.includes(null)) return 'Draw';
        return null;
    }

    private reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        if (this.container) this.render(this.container);
    }
}

export class RidhiQuiz implements Minigame {
    name = "The Ridhi Mastermind Quiz";
    private currentQuestion = 0;
    private score = 0;
    private container: HTMLElement | null = null;

    private questions = [
        { q: "What is Ridhi's natural reaction to stress?", a: ["Absolute silence", "Uncontrollable laughter", "Organizing her desk", "Eating everything"], correct: 1 },
        { q: "How often does she say 'chal nikal'?", a: ["Only when angry", "Twice a week", "Every 5 minutes", "∞ (It's her punctuations)"], correct: 3 },
        { q: "What's her actual superpower?", a: ["Incredible memory", "Infinite overthinking", "Teleportation", "Perfect sense of direction"], correct: 1 },
        { q: "Ridhi is 'on the way' when she is actually:", a: ["In her car", "Looking for shoes", "Still in pajamas", "Already there"], correct: 2 }
    ];

    render(container: HTMLElement) {
        this.container = container;
        this.showQuestion();
    }

    private showQuestion() {
        if (!this.container) return;
        if (this.currentQuestion >= this.questions.length) {
            this.showResult();
            return;
        }

        const q = this.questions[this.currentQuestion];
        this.container.innerHTML = `
            <h3 style="margin-bottom: 1rem; font-family: 'Space Grotesk', sans-serif;">${this.name}</h3>
            <p style="font-size: 1.4rem; margin-bottom: 2rem; line-height: 1.4;">${q.q}</p>
            <div class="quiz-options">
                ${q.a.map((opt, i) => `<div class="quiz-option" data-index="${i}">${opt}</div>`).join('')}
            </div>
            <p style="margin-top: 2rem; opacity: 0.7;">Question ${this.currentQuestion + 1} of ${this.questions.length}</p>
        `;

        this.container.querySelectorAll('.quiz-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAnswer(parseInt((opt as HTMLElement).getAttribute('data-index') || '0'), opt as HTMLElement);
            });
        });
    }

    private handleAnswer(index: number, element: HTMLElement) {
        const q = this.questions[this.currentQuestion];
        const options = this.container?.querySelectorAll('.quiz-option');
        options?.forEach(opt => (opt as HTMLElement).style.pointerEvents = 'none');

        if (index === q.correct) {
            this.score++;
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
            (options?.[q.correct] as HTMLElement).classList.add('correct');
        }

        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    private showResult() {
        if (!this.container) return;
        this.container.innerHTML = `
            <h3 style="margin-bottom: 1rem; font-family: 'Space Grotesk', sans-serif;">Quiz Results</h3>
            <p style="font-size: 2rem; margin-bottom: 2rem;">Score: ${this.score} / ${this.questions.length}</p>
            <p style="font-size: 1.2rem; color: var(--accent-pink);">${this.score === this.questions.length ? "You are basically her twin! 👑" : "You need to spend more time with her! 😂"}</p>
            <button class="quirky-btn primary mt-4" id="quiz-retry">Try Again</button>
        `;

        this.container.querySelector('#quiz-retry')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentQuestion = 0;
            this.score = 0;
            this.showQuestion();
        });
    }
}

export class GuessThePerson implements Minigame {
    name = "The Mystery Person Guess";
    private currentHint = 0;
    private container: HTMLElement | null = null;
    private hints = [
        "He's a guy and clicks amazing pictures! 📸 (Hint 1/3)",
        "Overeating se bhi zyada khana he eats! 🍕🍔 (Hint 2/3)",
        "\"Mai office se nikal gaya hu, oreo shake bana dogi kya?\" 😋 (Hint 3/3)"
    ];

    render(container: HTMLElement) {
        this.container = container;
        this.showHint();
    }

    private showHint() {
        if (!this.container) return;
        
        const isSecondHint = this.currentHint === 1;

        this.container.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; font-family: 'Space Grotesk', sans-serif;">${this.name}</h3>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 2rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 2rem; min-height: 120px; display: flex; align-items: center; justify-content: center;">
                <p style="font-size: 1.3rem; line-height: 1.6; margin: 0; text-align: center;">${this.hints[this.currentHint]}</p>
            </div>
            
            <div id="guess-controls" style="display: flex; flex-direction: column; gap: 15px; justify-content: center; align-items: center;">
                ${isSecondHint ? `<p style="font-size: 0.9rem; opacity: 0.7; color: var(--accent-pink);">Before I give the 3rd hint, make a guess! 🤫</p>` : ''}
                
                ${this.currentHint < this.hints.length - 1 
                    ? `<button class="quirky-btn primary" id="next-hint">Next Hint</button>`
                    : `<button class="quirky-btn primary" id="reveal-answer">Answer:</button>`
                }
            </div>

            <div id="reveal-final" style="display: none; flex-direction: column; align-items: center; gap: 10px; animation: princessEntrance 0.6s ease;">
                <p style="font-size: 1.5rem; color: var(--accent-pink); font-weight: bold; margin-bottom: 0.5rem;">Yes its youuu didi ke husband!! 😂</p>
                <p style="font-size: 1.8rem; font-weight: 900; color: white; text-shadow: 0 0 15px var(--accent-pink);">Hila dala na!!! 🤯💥</p>
            </div>
            
            <div style="margin-top: 2rem; display: flex; gap: 10px; justify-content: center;">
                ${this.hints.map((_, i) => `<div style="width: 10px; height: 10px; border-radius: 50%; background: ${i <= this.currentHint ? 'var(--accent-pink)' : 'rgba(255,255,255,0.2)'};"></div>`).join('')}
            </div>
        `;

        this.container.querySelector('#next-hint')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentHint++;
            this.showHint();
        });

        this.container.querySelector('#reveal-answer')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const controls = this.container?.querySelector('#guess-controls') as HTMLElement;
            const final = this.container?.querySelector('#reveal-final') as HTMLElement;
            if (controls) controls.style.display = 'none';
            if (final) final.style.display = 'flex';
        });
    }
}

export class BestBrotherGame implements Minigame {
    name = "The Ultimate Truth";
    private container: HTMLElement | null = null;

    render(container: HTMLElement) {
        this.container = container;
        this.container.innerHTML = `
            <div class="minigame-wrapper" style="text-align: center; padding: 1rem;">
                <h3 style="margin-bottom: 2rem; font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem;">The Ultimate Question</h3>
                <p style="font-size: 1.5rem; margin-bottom: 3rem; line-height: 1.4;">Do you agree that your brother is the best and the legend in the whole wide world? 🌎✨</p>
                
                <div style="display: flex; gap: 40px; justify-content: center; align-items: center; min-height: 150px; position: relative;" id="bb-controls">
                    <button class="quirky-btn primary" id="bb-yes" style="padding: 15px 40px; font-size: 1.2rem; min-width: 140px;">YES! 😍</button>
                    <button class="quirky-btn" id="bb-no" style="padding: 15px 40px; font-size: 1.2rem; min-width: 140px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);">No 🤨</button>
                </div>
                
                <div id="bb-result" style="margin-top: 3rem; font-size: 1.8rem; font-weight: bold; color: var(--accent-pink); display: none; animation: princessEntrance 0.8s ease;">
                    I KNEW IT! ❤️ <br> Best sister ever! 🏆
                </div>
            </div>
        `;

        const yesBtn = this.container.querySelector('#bb-yes');
        const noBtn = this.container.querySelector('#bb-no') as HTMLElement;
        const result = this.container.querySelector('#bb-result') as HTMLElement;
        const controls = this.container.querySelector('#bb-controls') as HTMLElement;

        yesBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (controls) controls.style.opacity = '0';
            setTimeout(() => {
                if (controls) controls.style.display = 'none';
                if (result) result.style.display = 'block';
            }, 300);
        });

        // The "No" button prank: It jumps away when hovered or clicked
        const moveNo = () => {
            const containerRect = this.container?.getBoundingClientRect();
            if (!containerRect || !noBtn) return;

            // Random position within the modal container
            const maxX = (containerRect.width / 2) - noBtn.offsetWidth;
            const maxY = (containerRect.height / 2) - noBtn.offsetHeight;
            
            const newX = (Math.random() - 0.5) * 2 * maxX;
            const newY = (Math.random() - 0.5) * 2 * maxY;

            noBtn.style.position = 'absolute';
            noBtn.style.left = '50%';
            noBtn.style.top = '50%';
            noBtn.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px))`;
            noBtn.style.zIndex = '1000';
        };

        noBtn.addEventListener('mouseover', moveNo);
        noBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveNo();
        });
        noBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moveNo();
        });
    }
}

export class RidhimaAcrostic implements Minigame {
    name = "The Name Mystery";
    private container: HTMLElement | null = null;
    private words = [
        { word: "RADHA", hint: "Papas first name", targetIdx: 0, prefilled: [1, 4] },
        { word: "AMERICAN", hint: "Your current origin", targetIdx: 4, prefilled: [0, 2, 7] },
        { word: "INDIAN", hint: "Your origin", targetIdx: 2, prefilled: [0, 5] },
        { word: "HEARTBEAT", hint: "Dhak Dhak in English", targetIdx: 0, prefilled: [1, 2, 4, 5, 7, 8] },
        { word: "SIBASISH", hint: "Who's sitting beside you?", targetIdx: 1, prefilled: [0, 4, 7] },
        { word: "MOHANTY", hint: "Surname bruhh", targetIdx: 0, prefilled: [2, 5] },
        { word: "REVA", hint: "College ka naam", targetIdx: 3, prefilled: [0, 1] }
    ];

    render(container: HTMLElement) {
        this.container = container;
        const maxTargetIdx = Math.max(...this.words.map(w => w.targetIdx));
        const inputWidth = 45; // Increased from 35
        const gap = 8; // Increased from 5
        
        this.container.innerHTML = `
            <div class="acrostic-container" style="display: flex; flex-direction: column; align-items: center; width: 100%; padding: 0 10px;">
                <h3 style="margin-bottom: 1rem; font-family: 'Space Grotesk', sans-serif;">${this.name}</h3>
                <p style="margin-bottom: 2rem; opacity: 0.8; font-size: 0.9rem; text-align: center;">Fill in the blanks to reveal a secret name vertically! ✨</p>
                
                <div id="acrostic-grid" style="display: flex; flex-direction: column; gap: 12px; width: 100%; align-items: flex-start;">
                    ${this.words.map((w, rowIdx) => {
                        const offset = (maxTargetIdx - w.targetIdx) * (inputWidth + gap);
                        return `
                            <div class="acrostic-row" style="display: flex; align-items: center; width: 100%; min-height: 55px;">
                                <div class="hint-col" style="width: 160px; text-align: right; margin-right: 25px; font-size: 1rem; opacity: 0.8; flex-shrink: 0; line-height: 1.2;">
                                    ${w.hint}
                                </div>
                                <div class="inputs-wrapper" style="display: flex; gap: ${gap}px; align-items: center; margin-left: ${offset}px;">
                                    ${w.word.split('').map((char, charIdx) => {
                                        const isPrefilled = w.prefilled.includes(charIdx);
                                        const isTarget = charIdx === w.targetIdx;
                                        return `
                                            <input type="text" 
                                                   maxlength="1" 
                                                   data-row="${rowIdx}" 
                                                   data-char="${charIdx}" 
                                                   value="${isPrefilled ? char : ''}"
                                                   ${isPrefilled ? 'readonly' : ''}
                                                   style="width: ${inputWidth}px; height: ${inputWidth}px; text-align: center; border-radius: 6px; border: 1px solid ${isTarget ? 'var(--accent-pink)' : 'rgba(255,255,255,0.2)'}; background: ${isPrefilled ? 'rgba(255,255,255,0.1)' : (isTarget ? 'rgba(255,107,139,0.1)' : 'rgba(255,255,255,0.05)')}; color: white; font-weight: bold; text-transform: uppercase; ${isPrefilled ? 'cursor: default;' : ''}"
                                                   class="acrostic-input ${isTarget ? 'target-col' : ''} ${isPrefilled ? 'prefilled' : ''}">
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div id="acrostic-result" style="font-size: 1.8rem; font-weight: bold; color: var(--accent-pink); height: 3rem; margin-top: 2rem; text-align: center; width: 100%;"></div>
            </div>
        `;
        
        // Initial check for prefilled words
        setTimeout(() => this.checkSolution(), 100);

        const inputs = container.querySelectorAll('.acrostic-input');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                
                // Jump to next input
                if (target.value && target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).focus();
                }
                
                this.checkSolution();
            });

            input.addEventListener('keydown', (e) => {
                const target = e.target as HTMLInputElement;
                if ((e as KeyboardEvent).key === 'Backspace' && !target.value && target.previousElementSibling) {
                    (target.previousElementSibling as HTMLElement).focus();
                }
            });
        });
    }

    private checkSolution() {
        const rows = this.container?.querySelectorAll('#acrostic-grid > div');
        let allCorrect = true;

        this.words.forEach((w, rowIdx) => {
            const rowInputs = rows?.[rowIdx].querySelectorAll('input');
            let wordAttempt = "";
            rowInputs?.forEach(input => wordAttempt += (input as HTMLInputElement).value.toUpperCase());
            
            if (wordAttempt === w.word) {
                rowInputs?.forEach(input => {
                    (input as HTMLInputElement).style.borderColor = "#00ff80";
                    (input as HTMLInputElement).style.background = "rgba(0,255,128,0.1)";
                });
            } else {
                allCorrect = false;
            }
        });

        if (allCorrect) {
            const result = this.container?.querySelector('#acrostic-result') as HTMLElement;
            if (result) result.textContent = "RIDHIMA ✨";
            
            // Highlight the vertical word
            this.container?.querySelectorAll('.target-col').forEach(el => {
                (el as HTMLElement).style.background = "var(--accent-pink)";
                (el as HTMLElement).style.color = "white";
                (el as HTMLElement).style.transform = "scale(1.1)";
                (el as HTMLElement).style.transition = "all 0.5s ease";
            });
        }
    }
}
