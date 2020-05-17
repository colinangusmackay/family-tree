---
layout: post
title: Same sex unions in GEDCOM files
date: 2020-05-04 17:42
category: articles
tags:
  - GEDCOM
  - same-sex marriage
---

The world-wide de facto standard for transferring genealogy information is the GEDCOM file format. It surprised me to find out that this was a standard created and maintained by the Church of Jesus Christ of Latter Day Saints, sometimes known as Mormons.

I suspect as a result of this association there are certain aspects of the file format that show bias towards the LDS, such as certain events pertaining to various ceremonies in the church, or a lack of ability to easily represent certain family shapes that would occur outside of the mainstream church[^mainstream-church].

For example, the file format's definition of a family include a record for a husband and a wife (tagged `HUSB` and `WIFE` respectively). This implies several assumptions:
* A couple who have children must be married, but we may just be missing the marriage details.
* Same sex unions, civil partnerships, or marriages don't exist[^current-file-format].
 And although some software attempts to ignore this and use the gender from the two individuals to work out what is really going on, it does make things confusing.

![Adam and Steve - The first same-sex marriage]({{ site.baseurl }}/assets/images/adam-and-steve.jpg)

And here's what the relevant portion of the file looks like:

~~~
0 @I1@ INDI
1 NAME Adam //
1 SEX M
1 FAMS @F30@
0 @I2@ INDI
1 NAME Steve //
1 SEX M
1 FAMS @F3@
0 @F3@ FAM
1 MARR
2 DATE 04 MAY 2019
1 HUSB @I1@
1 WIFE @I2@
~~~

As you can see here, the software has been forced to tag Steve as the wife (line 13) because of the file format. When interpreting the file, I've decided to ignore the `HUSB` and `WIFE` tags and treat them as if they were first and second spouse. I get the gender of the spouses from the `SEX` tag on the individual record.

---

[^mainstream-church]: The reason I say "Mainstream Church" specifically is that there is a [fundamentalist sect](https://en.wikipedia.org/wiki/Mormon_fundamentalism) that uphold the principle of plural marriage, which the file format does not directly support.

[^current-file-format]: The current file format definition, v5.5.1, was published on 15th of November, 2019. For more information see: [https://www.familysearch.org/developers/docs/guides/gedcom](https://www.familysearch.org/developers/docs/guides/gedcom)