const siteUrl = "{{ site.url }}";

// Number the lines in code blocks
(function() {
    const pre = document.getElementsByTagName('pre'),
          pl = pre.length;
    for (let i = 0; i < pl; i++) {
        pre[i].innerHTML = '<span class="line-number"></span>' + pre[i].innerHTML + '<span class="cl"></span>';
        const num = pre[i].innerHTML.split(/\n/).length - 1;
        for (let j = 0; j < num; j++) {
            var line_num = pre[i].getElementsByTagName('span')[0];
            line_num.innerHTML += '<span>' + (j + 1) + '</span>';
        }
    }
})();

// Mark external links

(function(){
    const postContents = document.getElementsByClassName('page-content');
    for(let content of postContents){
        const anchors = content.getElementsByTagName('a');
        for(let anchor of anchors){
            const href = anchor.getAttribute("href");
            console.log("Checking URL "+href)
            if (href.includes("//") && !href.includes(siteUrl)){
                console.log("  -> External!");
                anchor.innerHTML = anchor.innerHTML + '<span class="ext-link fas fa-external-link-alt"></span>';
                anchor.setAttribute("target", "_blank");
            }
            else{
                console.log("  -> Internal.");
            }
        }
    }
})();