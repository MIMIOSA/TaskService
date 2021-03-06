var NPCpic = {
    npc_0: "NPC1_png",
    npc_1: "NPC2_png",
    ACCEPTABLEImage: "exclamation_png",
    DURINGImage: "question_png",
    CAN_SUBMITImage: "question_png",
};

class NPC implements Observer {

    public npcStage: egret.DisplayObjectContainer;

    taskService: TaskService;
    task: Task;

    npcId: string;
    npcName: string;

    emoji: egret.Bitmap;
    tileSize: number = 80;
    emojiX: number = 0;
    emojiY: number = 64;

    npcStageShape: egret.Shape;
    npcStageX: number;
    npcStageY: number;
    npcStageWidth = 80;
    npcStageHeight = 100;

    taskNoneState: State;
    taskAvilableState: State;
    taskSubmitState: State;
    taskDuringState: State;
    taskStateMachine: StateMachine;
    NPCtalkpanel: DialoguePanel;

    public constructor(npcId: string, npcName: string, taskService, NPCtalkpanel: DialoguePanel) {
        this.npcStage = new egret.DisplayObjectContainer();
        this.npcStageShape = new egret.Shape();
        this.emoji = new egret.Bitmap();
        this.npcId = npcId;
        this.npcName = npcName;
        this.taskService = taskService;
        this.taskService.Attach(this, "NPC");

        this.taskNoneState = new TaskNoneState(this);
        this.taskAvilableState = new TaskAvilableState(this);
        this.taskDuringState = new TaskDuringState(this);
        this.taskSubmitState = new TaskSubmitState(this);

        this.taskStateMachine = new StateMachine(this.taskNoneState);
        this.NPCtalkpanel = NPCtalkpanel;
    }

    getTask() {
        this.task = this.taskService.getTask(this.rule, this.npcId);
        console.log("This Task State: " + this.task.status);
        this.checkState();
    }


    setNpc_0(npcX: number, npcY: number) {
        this.emoji.texture = RES.getRes(NPCpic.npc_0);
        this.emoji.x = this.emojiX;
        this.emoji.y = this.emojiY;
        this.emoji.width = this.tileSize;
        this.emoji.height = this.tileSize;
        this.npcStageX = npcX;
        this.npcStageY = npcY;
        //this.setemoji();
    }
    setNpc_1(npcX: number, npcY: number) {
        this.emoji.texture = RES.getRes(NPCpic.npc_1);
        this.emoji.x = this.emojiX;
        this.emoji.y = this.emojiY;
        this.emoji.width = this.tileSize;
        this.emoji.height = this.tileSize;
        this.npcStageX = npcX;
        this.npcStageY = npcY;
        //this.setemoji();
    }

    drawNpcShape() {

    }

    drawNpc() {
        this.drawNpcShape();
        this.npcStageShape.graphics.drawRect(0, 0, this.npcStageWidth, this.npcStageHeight);
        this.npcStageShape.graphics.endFill();

        this.npcStage.x = this.npcStageX;
        this.npcStage.y = this.npcStageY;
        this.npcStage.width = this.npcStageWidth;
        this.npcStage.height = this.npcStageHeight;

        this.npcStage.addChild(this.npcStageShape);
        this.npcStage.addChild(this.emoji);
        this.emoji.touchEnabled = true;
        this.emoji.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onNpcClick, this);
    }

    checkState() {
        switch (this.task.status) {
            case TaskStatus.UNACCEPTABLE:
            case TaskStatus.SUBMITTED:
                this.taskStateMachine.changeState(this.taskNoneState);
                break;

            case TaskStatus.ACCEPTABLE:
                if (this.task.fromNpcId == this.npcId) {
                    this.taskStateMachine.changeState(this.taskAvilableState);
                } else {
                    this.taskStateMachine.changeState(this.taskNoneState);
                }
                break;
            case TaskStatus.DURING:
                if (this.task.toNpcId == this.npcId) {
                    this.taskStateMachine.changeState(this.taskDuringState);
                } else {
                    this.taskStateMachine.changeState(this.taskNoneState);
                }
                break;


            case TaskStatus.CAN_SUBMIT:
                if (this.task.toNpcId == this.npcId) {
                    this.taskStateMachine.changeState(this.taskSubmitState);
                } else {
                    this.taskStateMachine.changeState(this.taskNoneState);
                }
                break;
        }

    }

    onNpcClick(e: egret.TouchEvent, task: Task = this.task, npcid: string = this.npcId) {
        this.taskService.checkTaskStatus(task, npcid, this.NPCtalkpanel);
    }

    onChange(task: Task) {
        this.task = task;
        this.checkState();
    }

    rule(taskList: Task[], npcId: string): Task {
        for (var i = 0; i < taskList.length; i++) {
            if (taskList[i].fromNpcId == npcId || taskList[i].toNpcId == npcId) {
                return taskList[i];

            }
        }
    }

}

interface State {
    onEnter: Function;

    onExit: Function

}

class StateMachine {

    private currentState: State;

    public constructor(currentState: State) {
        this.currentState = currentState;
        this.currentState.onEnter();
    }

    public changeState(nextState: State): void {
        this.currentState.onExit();
        this.currentState = nextState;
        this.currentState.onEnter();
    }

    public getState(): State {
        return this.currentState;

    }

}

