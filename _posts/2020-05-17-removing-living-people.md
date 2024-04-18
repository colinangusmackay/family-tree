---
layout: post
title: Excluding Living People
date: 2020-05-17 12:56
category: articles
tags:
  - living people
---

Naturally, when creating a family tree I started with myself and my immediate relatives, most of whom are still living. When I created this website I realised that I shouldn't be displaying information about living people. 

As I was writing the software that extracts information from the GEDCOM file to create this site I made some efforts to exclude living people. However, this is was not foolproof. I knew there would be errors and I have endeavoured to err on the side of caution so that some false positives are excluded, but hopefully no false negatives. i.e. Sometimes the software thinks a person is alive when they have died.

**Rule One**

My strategy has been to first of all look for a death date. If the data says a person has died then we can display their information. That's an easy one.

**Rule Two**

Next, I look for a birth date and if that is sufficiently long ago then we can assume the person has died. It is currently set to 100 years. So, as of today, if a person was born on 17th May, 1920 but I have no death date the software will create a page for them. If they were born on 18th May, 1920 it won't.

**Rule Three**

Next, I look at sources. I am trying to ensure that all information in this site is sourced and referenced, but some sources will make mention of multiple people. For example, I found out one person had a daughter simply because the registration of their death was informed by their son-in-law. That source is not currently shown because I don't know whether the son-in-law is still alive right now. Sources will still be cited but, the information will be redacted on the source page like this:

> _Redacted because this source is referenced by a (potentially) living person and may contain personally identifiable information._

At the bottom of the source page is a list of people that reference the source, however potentially living people are excluded from this list.

Any notes attached to the source will still be displayed, but names of potentially living people referenced by the source will be redacted.

**Rule Four**

Some of the source metadata may also contain information about living people. In particular the title may reference a person as I've taken to trying to give sources a standardised title based on year, followed by name, then what the source is. e.g. "1900 MACKAY, WILLIAM ALEXANDER - Statutory Registers, Births". 

A source that is for a birth may represent a person who is still alive, however, the same source can be used to determine the parents and may be referenced by them. The source title will contain the name of the living child. In these cases a slightly rough approach is taken. The names of everyone who is potentially living and referenced by a source are used as a mask. If any of those names appear in the title they are replaced with an "X". This does mean that the family name may be masked out.

**Rule Five**

Notes on a person's page are removed when the note comes from an entry on a potentially living person. e.g. A note on the birth of a sibling will be removed if the sibling is still alive.

