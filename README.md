Nodes Like This
===============

Nodes Like This is a Drupal 7 module which helps you avoid creating duplicate
articles (or other content types).  Enter a title for a new node of a type for
which Nodes Like This has been enabled, and a list of any nodes with similar
titles appears.  If any of the content type's fields have been added to the
content type's corresponding Nodes Like This view, then entering data in those
fields will narrow the list of similar nodes.

Known issues
------------
* Views may not immediately work after they are created.  In testing, the views
  return a 404 page not found error.  This may be related to [this Drupal 6
  issue][http://drupal.org/node/1422634].
* The system may fail to filter by a content type field if the machine name and
  label are not similar.  This is unlikely to happen unless you change a label
  after it is created.  

Copyright
---------

The MIT License

Copyright (c) 2012 Automation Excellence

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
