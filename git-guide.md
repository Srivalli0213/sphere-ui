### Basic git commands


`git status`: To check what to do

**Note:** There are 3 stages in git to push code

Do you code changes and then do 

- Add changes to staging area
git add <file_name> //Push only one file 
Example: git add data.json


git add . //Push all fles

Commit your changes
git commit -m "Dashboard fixes"

Push your changes
git push

Delete a branch 
git branch -D <branch_name>
Example: git branch -D feature/side-bar

Create a branch
git branch <branch_name>
Example: git branch BUG-005

Go to a specific banch
git checkout <branch_name> 
Exmaple: git checkout BUG-005