import { JSDOM } from 'jsdom';
import { Config } from '../modules/Config';

class IndexBuilder
{
    public static CreateIndex(html: string, depth: any = 5)
    {
        if(depth == undefined || depth <= 0 || depth > 5) depth = 5;

        const dom = new JSDOM(html);

        if(dom.window.document.body.innerHTML.indexOf(Config.Translation.Get("Index")) != -1)
            return "";

        const titles = dom.window.document.querySelectorAll("h2, h3, h4, h5, h6");

        let prevLevel = 0;

        let outHtml = "<h2 class='is-3'>" + Config.Translation.Get("Index") + "</h2>" + 
            "<!--a-- class='button'>Collapse</!--a--><ul>";
        let currentDepth = 0;

        titles.forEach((title)=>
        {
            const level = this.GetTitleLevel(title.tagName);

            if(prevLevel == 0)
            {
                outHtml += "<li><a href='#" + title.id + "'>" + title.textContent + "</a>";
                currentDepth++;
                prevLevel = level;
            }
            else if(prevLevel == level && currentDepth <= depth)
            {
                outHtml += "</li><li><a href='#" + title.id + "'>" + title.textContent + "</a>";
                prevLevel = level;
            }
            else if(prevLevel < level && currentDepth < depth)
            {
                outHtml += "<ul>"
                outHtml += "<li><a href='#" + title.id + "'>" + title.textContent + "</a>";
                currentDepth++;
                prevLevel = level;
            }
            else if(prevLevel > level)
            {
                for(let i = 0; i < prevLevel - level; i++)
                {
                    outHtml += "</ul>";
                    currentDepth--;
                }
                outHtml += "<li><a href='#" + title.id + "'>" + title.textContent + "</a>";
                prevLevel = level;
            }
        });

        outHtml += "</li></ul>";

        return outHtml;
    }

    private static GetTitleLevel(tag: string)
    {
        for (let i = 1; i <= 6; i++)
        {
            if(tag.indexOf(i.toString()) !== -1) return i;
        }

        return 0;
    }
}

export = IndexBuilder;