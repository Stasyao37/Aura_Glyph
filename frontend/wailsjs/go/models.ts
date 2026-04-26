export namespace presets {
	
	export class Preset {
	    name: string;
	    fontFamily: string;
	    fontSize: number;
	    lineHeight: number;
	    theme: string;
	
	    static createFrom(source: any = {}) {
	        return new Preset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.fontFamily = source["fontFamily"];
	        this.fontSize = source["fontSize"];
	        this.lineHeight = source["lineHeight"];
	        this.theme = source["theme"];
	    }
	}

}

