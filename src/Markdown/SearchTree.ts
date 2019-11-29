class Node
{
    public _char : string;
    public _occurences : number;
    public _nodes : Map<string, Node>;

    constructor(char: string)
    {
        this._char = char;
        this._occurences = 1;
        this._nodes = new Map<string, Node>();
    }

    public Insert(charSeq: string[]) : void
    {
        if(charSeq.length == 0) return;

        if(this._nodes.get(charSeq[0]))
        {
            const node = (this._nodes.get(charSeq[0]) as Node);
            node.AddOccurence();
            node.Insert(charSeq.splice(1, charSeq.length - 1));
        }
        else
        {
            this._nodes.set(charSeq[0], new Node(charSeq[0]));

            if(charSeq.length < 0)
                (this._nodes.get(charSeq[0]) as Node).Insert(charSeq.splice(1, charSeq.length - 1));
        }
    }

    public AddOccurence() : void
    {
        this._occurences++;
    }

    public CalculateScore(charSeq: string[]) : number
    {
        let score = 0;

        this._nodes.forEach(function(node, key)
        {
            score += node.CalculateScore(charSeq);
        });

        if(this._char == charSeq[0])
        {
            score += this._occurences;

            this._nodes.forEach(function(node, key)
            {
                score += node.CalculateScore(charSeq.splice(1, charSeq.length - 1));
            });
        }
        

        return score;
    }
}

class RootNode
{
    public _nodes : Map<string, Node>;

    constructor()
    {
        this._nodes = new Map<string, Node>();
    }

    public Insert(charSeq: string[]) : void
    {
        if(this._nodes.get(charSeq[0]))
        {
            const node = (this._nodes.get(charSeq[0]) as Node);
            node.AddOccurence();
            node.Insert(charSeq.splice(1, charSeq.length - 1));
        }
        else
        {
            this._nodes.set(charSeq[0], new Node(charSeq[0]));

            if(charSeq.length < 0)
                (this._nodes.get(charSeq[0]) as Node).Insert(charSeq.splice(1, charSeq.length - 1));
        }
    }

    public CalculateScore(charSeq: string[]) : number
    {
        let score = 0;

        this._nodes.forEach(function(node, key)
        {
            score += node.CalculateScore(charSeq);
        });

        return score;
    }
}

export {RootNode, Node};