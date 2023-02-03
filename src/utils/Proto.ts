type Ctor = Constructor<any, any>;

export const extendsClass = (base: Ctor, derived: Ctor, matchSame: boolean = false) => 
{
	return derived.prototype instanceof base || (matchSame && (derived === base));
}