abstract class TreeNode
{
    public _nodes : Map<string, TreeNode>;

    constructor()
    {
        this._nodes = new Map<string, TreeNode>();
    }

    /**
     *  Insert a charsequence into the tree
     * @param charSeq The char sequence to insert
     */
    public Insert(charSeq: string[]) : void
    {
        if(charSeq.length <= 0) return; 

        if(this._nodes.get(charSeq[0]))
        {
            const node = (this._nodes.get(charSeq[0]) as Node);
            node.AddOccurence();
            node.Insert(charSeq.splice(1, charSeq.length - 1));
        }
        else
        {
            this._nodes.set(charSeq[0], (new Node(charSeq[0]) as TreeNode));

            const node = (this._nodes.get(charSeq[0]) as Node);
            node.AddOccurence();
            node.Insert(charSeq.splice(1, charSeq.length - 1));
        }
    }

    /**
     * Calculate the score for this node from a given char sequence
     * @param charSeq The charsequence
     * @param depth The depth of the node
     */
    public CalculateScore(charSeq: string[], depth : number = 1) : number
    {
        let score = 0;
        
        if(charSeq == ['s'])
        {
            console.log(charSeq);
            throw new Error();
        } 

        this._nodes.forEach(function(node, key)
        {
            score += (node as Node).CalculateScore(charSeq, depth);
        });

        return score;
    }

    /**
     * Convert the node to json
     */
    public ToJson() : any
    {
        var obj : any = {};
        obj["Nodes"] = [];

        this._nodes.forEach((val, key) =>
        {
            obj["Nodes"].push(val.ToJson());
        });

        return obj;
    }

    /**
     * Calculate all occurences in the tree
     */
    public CalculateMaxScore() : number
    {
        let maxScore = 0;

        this._nodes.forEach(function(node, key)
        {
            maxScore += node.CalculateMaxScore();
        });

        return maxScore;
    }

    public FromJson(json: any)
    {
        json["Nodes"].forEach((nodeJson:any) =>
        {
            let node = new Node(nodeJson["Char"]);
            node.AddOccurence(nodeJson["Score"]);

            this._nodes.set(nodeJson["Char"], node);

            node.FromJson(nodeJson);
        });
    }
}

class Node extends TreeNode
{
    public _char : string;
    public _occurences : number;

    constructor(char: string)
    {
        super();
        this._char = char;
        this._occurences = 1;
    }

    /**
     * Add occurence to the node
     */
    public AddOccurence(occurences = 1) : void
    {
        this._occurences += occurences;
    }
    
    public CalculateScore(charSeq: string[], depth : number) : number
    {
        if(charSeq.length == 0) return 0;
        
        const prev = charSeq.slice();
        let score = super.CalculateScore(charSeq, depth + 1);
        charSeq = prev;

        if(this._char == charSeq[0])
        {
            if(charSeq.length == 1)
            {
                return score + this._occurences;
            }

            const newcharSeq = charSeq.splice(1, charSeq.length - 1);

            this._nodes.forEach(function(node, key)
            {
                score += node.CalculateScore(newcharSeq, depth + 1);
            });
        }

        return score;
    }

    public CalculateMaxScore()
    {
        let score = 0;

        this._nodes.forEach(function(node, key)
        {
            score += node.CalculateMaxScore();
        });

        return this._occurences + score;
    }

    public ToJson()
    {
        var obj : any = super.ToJson();

        obj["Char"] = this._char
        obj["Score"] = this._occurences;

        return obj;
    }
}

class RootNode extends TreeNode
{
    public _maxScore : number;

    constructor()
    {
        super();
        this._maxScore = 0;
    }

    public CalculateMaxScore() : number
    {
        this._maxScore = super.CalculateMaxScore();
        return this._maxScore;
    }

    public ToJson()
    {
        var obj : any = super.ToJson();

        obj["MaxScores"] = this._maxScore;

        return obj;
    }

    public FromJson(json: any)
    {
        this._maxScore = json["MaxScores"];
        super.FromJson(json);
    }
}

export {RootNode, Node, TreeNode};