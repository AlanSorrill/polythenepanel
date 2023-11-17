import React from 'react'
import { MouseGulag, PanelID, PanelID_IsEqual, PolytheneContainer, PolythenePanel, PolythenePanelProvider, PolythenePanel_State, RegisterPanel, } from '../Imports'

export type PP_Split_Direction = 'vertical' | 'horizontal';
export type PP_Split_State<Direction extends string> = PolythenePanel_State<['Default', `Split${Direction}`]> & {
    direction: PP_Split_Direction,
    alpha: number,
    childAState: PolythenePanel_State<[string & unknown, string & unknown]>,
    childBState: PolythenePanel_State<[string & unknown, string & unknown]>
}

export abstract class PP_Split<Direction extends string> extends PolythenePanel<['Default', `Split${Direction}`], PP_Split_State<Direction>> {



    getDisplayName(): string {
        return "Split";
    }
    getIcon(): React.ReactNode {
        return <div style={{ backgroundColor: 'black', color: 'white' }}>SPLT</div>
    }

    get isVertical() {
        return this.state.direction == 'vertical'
    }
    get isHorizontal() {
        return !this.isVertical;
    }

    static IsSplitName(name: PanelID<string,string>){
        return PanelID_IsEqual(name,['Default','SplitVertical']) || PanelID_IsEqual(name,['Default','SplitHorizontal'])
    }

    containerRef: React.RefObject<HTMLDivElement> = React.createRef();

    getBounds() {
        return this.containerRef.current ? this.containerRef.current.getBoundingClientRect() : null;
    }
    getWidth() {
        let bounds = this.getBounds();
        if (!bounds) {
            return null;
        }
        return bounds.width
    }
    getHeight() {
        let bounds = this.getBounds();
        if (!bounds) {
            return null;
        }
        return bounds.height
    }
    render(){
        return <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {this.needsPanelInit ? this.renderLoadingBody() : this.renderBody()}
        </div>
    }
    renderBody(): React.ReactNode {
        let root = this.getRoot();
        let ths = this;

        // let childA = root.router.renderContainer(this, (fresh) => { ths.setState({ childAState: fresh }) }, this.state.childAState);
        // let childB = root.router.renderContainer(this, (fresh) => { ths.setState({ childBState: fresh }) }, this.state.childBState);
        return <div ref={this.containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: this.state.direction == 'horizontal' ? 'row' : 'column' }}>
            <div key='childA' style={{
                width: this.isHorizontal ? `${this.state.alpha * 100}%` : '100%',
                height: this.isVertical ? `${this.state.alpha * 100}%` : '100%'
            }}>{
                    <PolytheneContainer buttonCorner={this.isHorizontal ? 'TopRight' : 'BottomLeft'} canExpand={!PP_Split.IsSplitName(this.state.childBState.panelTypeName)} barSide={this.isHorizontal ? 'Right' : 'Bottom'} originalState={this.state.childAState} parent={this.props.container} setState={(freshState: PolythenePanel_State<PanelID<string, string>>) => {
                        ths.setState({
                            childAState: freshState
                        })
                    }} onExpand={(freshState)=>{ths.props.container.props.setState(freshState)}} />
                }</div>
            <SplitPanelDivider key='divider' isHorizontal={this.isHorizontal} addAlpha={(delta) => {
                ths.setState({ alpha: ths.state.alpha + (delta / (ths.isHorizontal ? ths.getWidth() : ths.getHeight())) });
            }} />
            <div key='childB' style={{
                width: this.isHorizontal ? `${(1 - this.state.alpha) * 100}%` : '100%',
                height: this.isVertical ? `${(1 - this.state.alpha) * 100}%` : '100%'
            }}>{
                    <PolytheneContainer buttonCorner={this.isHorizontal ? 'TopLeft' : 'TopLeft'} canExpand={!PP_Split.IsSplitName(this.state.childAState.panelTypeName)} barSide={this.isHorizontal ? 'Left' : 'Top'} originalState={this.state.childBState} parent={this.props.container} setState={(freshState: PolythenePanel_State<PanelID<string, string>>) => {
                        ths.setState({ childBState: freshState })
                    }} onExpand={(freshState)=>{ths.props.container.props.setState(freshState)}} />
                }</div>
        </div>
    }
}
export interface SplitPanelDivider_Props {
    //parent: PP_Split<string>
    isHorizontal: boolean
    addAlpha: (delta: number) => void
}
export interface SplitPanelDivider_State { }
export class SplitPanelDivider extends React.Component<SplitPanelDivider_Props, SplitPanelDivider_State>{
    
    mouseGulag: MouseGulag<HTMLDivElement>;
    constructor(props: SplitPanelDivider_Props) {
        super(props);
        let ths = this;


        this.mouseGulag = new MouseGulag({
            onDrag(evt) {
                ths.props.addAlpha(ths.isHorizontal ? evt.movementX : evt.movementY);
            },
        })
    }
    get isHorizontal() {
        return this.props.isHorizontal
    }
    get isVertical() {
        return !this.props.isHorizontal
    }

    isMoving = false;
    render() {
        let ths = this;
        return <div style={{
            width: this.isHorizontal ? 8 : '100%',
            height: this.isVertical ? 8 : '100%',
            backgroundColor: 'lightgray',
            cursor: this.isHorizontal ? 'ew-resize' : 'ns-resize'
        }}  onMouseDown={(evt) => {
            ths.mouseGulag.capture(evt);
            
            // ths.isMoving = true;
        }}></div>
    }
}

@RegisterPanel('Default', 'SplitHorizontal',{})
export class PP_Split_Horizontal extends PP_Split<'Horizontal'>{
    getDefaultState(): PP_Split_State<'Horizontal'> {
        return {
            panelTypeName: ['Default', 'SplitHorizontal'],
            alpha: 0.5,

            childAState: {
                panelTypeName: ['Default', 'None'],

            },
            childBState: {
                panelTypeName: ['Default', 'None'],
            },
            direction: 'horizontal'
        }
    }
}
@RegisterPanel('Default', 'SplitVertical',{})
export class PP_Split_Vertical extends PP_Split<'Vertical'>{
    getDefaultState(): PP_Split_State<'Vertical'> {
        return {
            panelTypeName: ['Default', 'SplitVertical'],
            alpha: 0.5,
            childAState: {
                panelTypeName: ['Default', 'None'],

            },
            childBState: {
                panelTypeName: ['Default', 'None'],
            },
            direction: 'vertical'
        }
    }
}

// export class PPP_Split extends PolythenePanelProvider {
//     getDisplayName(): string {
//         return "Split";
//     }
//     renderIcon(): React.ReactNode {
//         return <div>SPLT</div>
//     }
//     renderBar(): React.ReactNode {
//         return null;
//     }
//     renderBody(): React.ReactNode {
//         throw new Error('Method not implemented.');
//     }

// }