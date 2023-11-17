import { ReactElement } from 'react'
import { PP_None_State } from './DefaultPanels/None_PolythenePanel'
import { IsUnion, PP_Split_State, PolythenePanel, PolythenePanel_State, TuplesToObject, UnionToArray } from './Imports'

export type PanelID<PackageName extends string, PanelName extends string> = [PackageName,PanelName]
export function PanelID_IsEqual(a: PanelID<string,string>,b:PanelID<string,string>): boolean{
    return a[0] == b [0] && a[1] == b[1];
}
export type PolytheneStyles = {
    barBackground: React.CSSProperties
}
export type Generic_Polythene_Options = Polythene_Options<string & unknown, Generic_PolythenePanel>
export type PanelUnionFrom<Options extends Generic_Polythene_Options> = Options extends Polythene_Options<infer PackageName, infer PanelUnion> ? (PanelUnion) : never
export type AnyStateFrom<Options extends Generic_Polythene_Options> = Options extends Polythene_Options<infer PackageName, infer PanelUnion> ? (PanelUnion extends PolythenePanel<any, infer State> ? State : never) : never
export type AnyPanelIdFrom<Options extends Generic_Polythene_Options> = AnyStateFrom<Options>['panelTypeName']//Options extends Polythene_Options<infer PackageName, infer PanelUnion> ? (PanelUnion extends PolythenePanel<infer PanelName, any> ? PanelName : never) : never

export type Polythene_Constructors<PanelUnion extends Generic_PolythenePanel> = Polythene_Constructors_Helper<PanelCollection<PanelUnion>>;
type Polythene_Constructors_Helper<PanelMap extends {} & unknown> = {
    [P in keyof PanelMap as P extends PanelID<infer PackageName, infer PanelName> ? PanelName : P]: PanelMap[P] extends PolythenePanel<PanelID<infer PackageName, infer PanelName>, infer PanelState> ? (
        (parent: Generic_PolythenePanel,setState: (freshState: PolythenePanel_State<PanelID<PackageName, PanelName>>)=>void,defaultState?: PolythenePanel_State<PanelID<PackageName, PanelName>>) => ReactElement<PanelMap[P]>
    ) : never
};
export type Polythene_Options<PackageName extends string, PanelUnion extends Generic_PolythenePanel> = {
    packageName: PackageName
    panels: Polythene_Constructors<PanelUnion>,
    styles: PolytheneStyles
}

let test: TuplesToObject<[['stuff', 'things'], ['otherStuff', 'otherThings']]>

// export type Generic_PolythenePanelStates = {
//     [key: string & unknown]: PolythenePanelState<typeof key>
// }
// export type PolythenePanelsTemplate<PanelStates extends Generic_PolythenePanelStates> = PanelStates

// export type DefaultPolythenePanels = PolythenePanelsTemplate<{
//     Split: PP_Split_State<Generic_PolythenePanelStates>,
//     None: PP_None_State
// }>
export type Generic_PolythenePanel_OfPackage<PackageName extends string> = PolythenePanel<[PackageName, string & unknown], unknown & PolythenePanel_State<PanelID<PackageName, string & unknown>>>;
export type Generic_PolythenePanel = PolythenePanel<PanelID<string & unknown, string & unknown>, unknown & PolythenePanel_State<PanelID<string & unknown, string & unknown>>>;
export type Generic_PanelCollection = {
    [key: string]: Generic_PolythenePanel
}
export type PanelCollection<PanelUnion extends Generic_PolythenePanel> = IsUnion<PanelUnion> extends false ? PanelCollection_Helper<[PanelUnion]> :
    PanelCollection_Helper<UnionToArray<PanelUnion>>
export type PanelCollection_Helper<PanelArr extends unknown[], Out extends unknown[] & [string, any][] = null> = PanelArr extends [infer First, ...infer Rest] ? (
    First extends PolythenePanel<infer name, infer state> ? (
        state extends PolythenePanel_State< PanelID<infer PackageName, infer PanelName>> ?
        (PanelCollection_Helper<Rest, Out extends null ? [[PanelName, First]] : [[PanelName, First], ...Out]>) : never
    ) : never
) : TuplesToObject<Out>;
// export type AnyPolythenePanel<PanelStates extends Generic_PolythenePanelStates> = PanelStates[keyof PanelStates] | DefaultPolythenePanels[keyof DefaultPolythenePanels]