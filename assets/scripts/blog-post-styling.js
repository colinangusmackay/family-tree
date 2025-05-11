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
            if (href.includes("//") && !href.includes(siteUrl)){
                anchor.innerHTML = anchor.innerHTML + '<span class="ext-link fas fa-external-link-alt"></span>';
                anchor.setAttribute("target", "_blank");
                anchor.setAttribute("rel", "noopener");
            }
        }
    }
})();

// Process the "on this day"
(function(){
    const duration = 6000; // Duration for each entry in milliseconds
    fetch('/family-tree/gedcom-info/on-this-day.json')
        .then(response => response.json())
        .then(data => {
            const today = new Date(); // new Date('2025-05-05'); // For testing, set a fixed date
            const month = today.getMonth(); // Month is 0-based in JavaScript
            const day = today.getDate() - 1; // Adjust for 0-based index
            var entries = data.Months[month].Days[day].Events;
            if (entries === undefined || entries=== null) {
                entries = [];
            }

            const onThisDayDiv = document.querySelector('.on-this-day');
            const onThisDayDivContent = document.querySelector('.on-this-day-content');
            if (entries.length === 0) {
                onThisDayDiv.style.display = 'none';
                return;
            }
            else{
                onThisDayDiv.style.display = 'block';
            }

            const spans = entries.map((entry, index) => {
                const markdownFragment = entry.Description;
                // Convert markdown fragment which contains links to HTML.
                const htmlFragment = markdownFragment.replace(/(\[([^\]]+)\]\(([^)]+)\))/g, '<a href="$3">$2</a>');
                const span = document.createElement('span');
                span.id = 'on-this-day-entry-' + index;
                span.innerHTML = htmlFragment;
                span.style.display = index === 0 ? 'block' : 'none'; // Show only the first entry
                return span;
            });

            spans.forEach(span => onThisDayDivContent.appendChild(span));

            if (spans.length > 1) {
                let currentIndex = 0;

                setInterval(() => {
                    spans[currentIndex].style.display = 'none';
                    currentIndex = (currentIndex + 1) % spans.length;
                    spans[currentIndex].style.display = 'block';
                }, duration);
            }
        })
        .catch(error => {
            console.error('Error loading on-this-day data:', error);
            document.querySelector('.on-this-day').style.display = 'none';
        });
})();