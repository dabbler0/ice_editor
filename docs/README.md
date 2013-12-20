Ice Editor
===========================
Ice Editor is a block-based text editor. Its interface will feel like Scratch or Blockly. The philosophical difference between Ice and block languages is that Ice imagines itself an editor with extremely strong syntax highlighting, whereas block languages imagine themselves entirely new langauges or syntaxes.

Ice is meant to be an educational tool, and is built to encourage kids to be independent of the blocks and start typing syntax on their own. However, it is powerful enough that even people who are already familiar with syntax might want to use it as a way of manipulating existing programs.

## The Problem of Introductory Programming
There are currently a lot of platforms for learning to program. Basically, we realize that there's a very long spectrum of skill and difficulty in computer science and programming, and that any platform is going to have a certain window that it captures. That is, there's a threshold and there's a limit. The first problem of introductory programming platforms is to make the threshold as low as possible and the limit as high as possible -- this way kids don't have to switch platforms every time they learn something new.

The second problem with introductory programming is motivational. There are a lot of kids who actively self-identify as people who "aren't good at math and science." They would never learn to program, even if they it were put right in front of them, because it's foreign and intimidating. Even if they take computer science classes, it's dry and difficult, and as soon as they get free of it they forget everything that happened there.

A lot of your learning when you're a beginner happens when making little things work on your own. This both requires and produces motivation. Once you've got a little thing working -- something **you** did **on your own**, you suddenly feel confident that you can do more. On the other hand, if you never feel like you can do something independently, you'll never try and you won't get into this cycle. That's where a lot of kids start -- programming is foreign, intimidating, dry, and too difficult, and we can't get out of this trap.

## The Success and Failure of Scratch
Scratch takes an ambitious swing at the second problem. It's clearly worked -- kids are using Scratch everywhere, and it's taught, popularly, in public schools. But it doesn't seem to produce that many serious developers, and that's because they haven't solved the first problem.

### Success: The Palette
There are two main questions kids need to answer when they're making something.

  1. What construct are you going to use (if/else, for, while, etc)?
  2. How do you form that construct? 

The existence of the Scratch palette solves both of these problems. The first question becomes multiple-choice: you've got a list of constructs right here on the left, and you just pick the one that looks right. At that point the second question is already answered -- you do it by dragging that block into your program. Eventually, after doing this a lot, they'll already know what construct they want, and finding it in the palette starts to take longer than thinking of it. That's a sign of progress.

### Success: The Selection of Blocks
Scratch is built for game-making. That's a big selling point, and probably one of the reasons it's so popularly used among kids. Kids play games all the time, and Scratch makes it simple for someone with no programming knowledge to make something that looks like a game in a very short time. The blocks are things like 'turn left', 'move forward', and the event handler for 'when arrow key up pressed'. Then the beginner programmer gets to play their creation, and they feel like they've accomplished something big on their own, and are probably already thinking about the next thing they're going to do. So Scratch has neatly dealt with lowering the threshold and motivating kids. What's the issue?

### Failure: The Language
The issue is that in moving the threshold down, Scratch has moved the ceiling down enormously as well. The Scratch language is inhibitively slow, barely Turing-complete, and looks so syntactically different from other languages that kids get scared. There are no professional-looking games on the Scratch community, because it's just impractical to impelement anything sophisticated in the language. So kids get into the language, make some simple games, and are stuck at that skill level forever. They can't move upward in Scratch, because the language isn't powerful enough. They can't move to other languages because of the same threshold gap that prevented them from doing so in the first place -- syntactic languages look foreign, intimidating, dry and too difficult. So they're stuck.

## Ice Editor
Ice Editor attempts to solve both of these problems simultaneously. Ice Editor is built to work like any other text editor -- it accepts and produces arbitrary text. So you take any existing, efficient, Turing-complete language (CoffeeScript is currently the language of choice), and just edit it with blocks, as if it were extra-powerful syntax highlighting. That's really all a block language is -- it's a syntax language with colors around the words and draggable lines and code blocks. The idea is to get kids to see that too, and through that realization become independent of Ice Editor. Since the blocks in Ice Editor work just like syntax highlighting, kids already see something that looks like real, verbatim CoffeeScript. So when they look at CoffeeScript in other syntax highlighters, it's familiar. Ice Editor also works as a normal text editor -- kids can insert lines between blocks by typing. As with Scratch, it will eventually be so that a beginner programmer knows what the block looks like before he can get his mouse over to the palette. At this point, she'll start typing it in, and ultimately just be editing with what's essentially a normal syntax-highlighting text editor.

Ice Editor aims to be as approachable as Scratch but as extensible as a text editor with CoffeeScript, and so is a fusion of both. It deals with syntax and grammar for kids until they're ready to deal with it themselves, then encourages them to type and move out into normal text editors. It's as accessible as Scratch's block language, and simutaneously powerful enough to edit itself, or the CoffeeScript interpreter, or any code written by anyone anywhere.
