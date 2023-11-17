import { CornerName, Generic_PolythenePanel, Icon, MaterialSymbol, MaterialSymbolValues, MouseGulag, NoSelect, PanelID, PanelList, PolytheneContainer, PolytheneRoot, PolytheneRouter, Side, SideIsHorizontal } from './Imports'
import React from 'react'


export interface PolythenePanel_Props<PanelName extends PanelID<unknown & string, unknown & string> & unknown> {
    defaultState: PolythenePanel_State<PanelName>
    container: PolytheneContainer
    buttonCorner: CornerName
    barSide: Side,
    canExpand: boolean
    onExpand?: (state: PolythenePanel_State<PanelID<unknown & string, unknown & string>>) => void
}
export interface PolythenePanel_State<PanelName extends PanelID<unknown & string, unknown & string> & unknown> {
    panelInstanceId?: number,
    panelTypeName: PanelName,
    loadDefaults?: boolean
}
export abstract class PolythenePanel<PanelName extends PanelID<unknown & string, unknown & string> & unknown, State extends PolythenePanel_State<PanelName>> extends React.Component<PolythenePanel_Props<PanelName>, State>{
    constructor(props: PolythenePanel_Props<PanelName>) {
        super(props);

        this.state = props.defaultState as any;

    }
    componentDidMount(): void {
        if (this.needsPanelInit) {
            let defaultState = this.getDefaultState();
            defaultState.panelInstanceId = PolytheneRouter.GetUid();
            defaultState.loadDefaults = false;
            this.setState(defaultState);
        }
    }
    isPanel: true = true
    abstract getIcon(): MaterialSymbol | React.ReactNode;
    abstract getDisplayName(): string
    abstract renderBody(): React.ReactNode;

    get needsPanelInit() {
        return (typeof this.state.loadDefaults == 'boolean' ? this.state.loadDefaults : false)
    }

    setState<K extends keyof State>(state: State | ((prevState: Readonly<State>, props: Readonly<PolythenePanel_Props<PanelName>>) => State | Pick<State, K>) | Pick<State, K>, callback?: () => void): void {
        let ths = this;
        super.setState(state, () => {
            ths.props.container.notifyPanelStateChanged(ths.state as any);
            if (callback) { callback() }
        });
    }
    abstract getDefaultState(): State
    getSaveState(): State {
        return this.state;
    }
    private _root: PolytheneRoot = null;
    getRoot(): PolytheneRoot {
        if (this._root) {
            return this._root;
        }
        if (!this.props.container) {
            return null;
        }
        this._root = this.props.container.getRoot();
        return this._root;
    }



    saveStateToUrl() {

    }
    renderBar(): React.ReactNode {
        return <div style={{
            // display: 'flex', position: 'absolute',
            // left: this.props.buttonCorner == 'BottomLeft' || this.props.buttonCorner == 'TopLeft' ? 0 : undefined,
            // top: this.props.buttonCorner == 'TopLeft' || this.props.buttonCorner == 'TopRight' ? 0 : undefined,
            // right: this.props.buttonCorner == 'BottomRight' || this.props.buttonCorner == 'TopRight' ? 0 : undefined,
            // bottom: this.props.buttonCorner == 'BottomLeft' || this.props.buttonCorner == 'BottomRight' ? 0 : undefined
        }}>

        </div>
    }
    renderLoadingBody() {
        return <div>Loading</div>
    }
    render() {
        let switchOrder = this.props.barSide == 'Bottom' || this.props.barSide == 'Right';
        let normalOrder = [<PolytheneBar side={this.props.barSide} panel={this} />, this.needsPanelInit ? this.renderLoadingBody() : <div style={{ flexGrow: 1, overflow: 'auto' }}>{this.renderBody()}</div>];
        return <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: SideIsHorizontal(this.props.barSide) ? 'row' : 'column' }}>
            {switchOrder ? normalOrder.reverse() : normalOrder}
        </div>
    }
}
export function RegisterPanelProvider<PackageName extends string>(packageName: PackageName) {
    console.log(`Register panel provider`);
    return function <PanelClass extends PolythenePanelProvider>(target: new () => PanelClass) {
        console.log(`Registering provider `, target);
        // PolytheneRouter._constructorMap.set(`${packageName}.${panelName}`, target as any);
    }
}
export abstract class PolythenePanelProvider {

    abstract getDisplayName(): string;
    abstract renderIcon(): React.ReactNode;
    abstract renderBar(): React.ReactNode | null;
    abstract renderBody(): React.ReactNode;
}

export interface PolytheneBar_Props {
    panel: Generic_PolythenePanel
    side: Side
}
export interface PolytheneBar_State {
    showList: boolean
}
export class PolytheneBar extends React.Component<PolytheneBar_Props, PolytheneBar_State>{
    constructor(props: PolytheneBar_Props) {
        super(props);
        this.state = {
            showList: false
        }
    }

    get showList() {
        return this.state.showList
    }
    set showList(fresh) {
        this.setState({ showList: fresh })
    }
    render() {
        let ths = this;
        let flexDir: React.CSSProperties['flexDirection'];
        let contentClassName: string;
        switch (this.props.side) {
            case 'Top':
            case 'Bottom':
                flexDir = 'row';
                contentClassName = '';
                break;
            case 'Left':
            case 'Right':
                flexDir = 'column';
                contentClassName = 'rotate90';
                break;
            default:
                debugger;
        }
        return <div style={{ display: 'flex', flexDirection: flexDir, position: 'relative', backgroundColor: fColor.darkMode[4].toHexString() }}>
            <PolytheneBarButton panel={this.props.panel} bar={this} />
            {this.state.showList ? <PanelList style={{ position: 'absolute', left: 0, top: 0, zIndex: 10 }} onSelected={(panelId) => {
                ths.props.panel.props.container.changePanel(panelId.split('.') as [string, string])
            }} /> : <div></div>}
            <div className={contentClassName} style={{ display: 'flex', flexDirection: 'column' }}><div style={{ flexGrow: 1 }} />{ths.props.panel.renderBar()}<div style={{ flexGrow: 1 }} /></div>
            <div style={{ flexGrow: 1 }} />
        </div>
    }
}

export interface PolytheneBarButton_Props {
    panel: Generic_PolythenePanel
    bar: PolytheneBar
}
export interface PolytheneBarButton_State {
    offset: [x: number, y: number],
    isDragging: boolean
}
export class PolytheneBarButton extends React.Component<PolytheneBarButton_Props, PolytheneBarButton_State>{
    mouseGulag: MouseGulag<HTMLDivElement>
    constructor(props: PolytheneBarButton_Props) {
        super(props);
        this.state = {
            offset: [0, 0],
            isDragging: false
        }
        let ths = this;
        this.mouseGulag = new MouseGulag<HTMLDivElement>({
            onDrag(evt) {
                let offset = [ths.state.offset[0] + evt.movementX, ths.state.offset[1] + evt.movementY];

                ths.setState({
                    offset: [ths.state.offset[0] + evt.movementX, ths.state.offset[1] + evt.movementY],
                    isDragging: true
                })
                console.log(ths.getOffsetAlpha())
            },
            onDragEnd(evt) {
                if (ths.getOffsetAlpha() > 0.7) {
                    ths.props.panel.props.onExpand?.(ths.props.panel.state)
                } else {
                    ths.setState({
                        offset: [0, 0],
                        isDragging: false
                    })
                }
            },
        });
    }
    canDrag(side: Side) {

    }
    getOffsetDirection(): Side {
        if (Math.abs(this.state.offset[0]) > Math.abs(this.state.offset[1])) {
            return this.state.offset[0] > 0 ? 'Right' : 'Left'
        }
        return this.state.offset[1] > 0 ? 'Bottom' : 'Top'
    }
    getOffset(): [number, number] {
        if (this.getOffsetDirection() != this.props.panel.props.barSide) {
            return [0, 0];
        }
        return Math.abs(this.state.offset[0]) > Math.abs(this.state.offset[1]) ? [this.state.offset[0], 0] : [0, this.state.offset[1]]
    }
    getOffsetAmount() {
        if (this.getOffsetDirection() != this.props.panel.props.barSide) {
            return 0
        }
        return Math.abs(Math.abs(this.state.offset[0]) > Math.abs(this.state.offset[1]) ? this.state.offset[0] : this.state.offset[1])
    }
    bgRef: React.RefObject<HTMLDivElement> = React.createRef();
    getBgSize() {
        return this.bgRef.current ? this.bgRef.current.getBoundingClientRect() : null;
    }
    getMaxOffset() {
        let size = this.getBgSize();
        if (!size) {
            return 0;
        }
        return SideIsHorizontal(this.props.panel.props.barSide) ? size.width : size.height
    }
    getOffsetAlpha() {
        let max = this.getMaxOffset();
        if (max == 0) {
            return 0;
        }
        return this.getOffsetAmount() / max;
    }
    render() {
        let ths = this;
        let offset = ths.getOffset();
        return <div key={'button'} ref={this.bgRef}
            onClick={() => {
                ths.props.bar.showList = !ths.props.bar.showList;
            }}
            onMouseDown={(evt) => {
                if (ths.props.panel.props.canExpand) {
                    ths.mouseGulag.ifDrag().onMouseDown(evt);
                }
            }}
            onMouseMove={(evt) => {
                if (ths.props.panel.props.canExpand) {
                    ths.mouseGulag.ifDrag().onMouseMove(evt);
                }
            }}
            style={{
                color: fColor.lightText[0].toHexString(),
                backgroundColor: fColor.darkMode[11].toHexString(), overflow: 'hidden', borderRadius: 4, padding: 4,
                transform: `translate(${offset[0]}px,${offset[1]}px)`,
                zIndex: this.mouseGulag.isMouseDown ? 10 : undefined
            }}><NoSelect>{this.renderIcon()}</NoSelect></div>
    }
    renderIcon() {
        let icon = this.props.panel.getIcon();
        if (typeof icon == 'string') {
            if (typeof MaterialSymbolValues[icon] == 'string') {
                return <Icon symbol={icon as MaterialSymbol} />
            }
        }
        return icon;
    }
}