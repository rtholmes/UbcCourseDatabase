## User Story 1
As a discord user, I want to generate and select query options so that I can create a query

#### Definitions of Done
Scenario 1: Creating a Query  
Given: The discord user calls a bot which gives it the option to customize settings  
When: The bot will display all settings that can be customized Filters, Columns, Sort, Group, Apply for the user to select  
Then: The user can then save the query to be used for a future queries  

## User Story 2
As a discord user, I want to tell the bot to verify then run a query, so I can view the results or get an error message if invalid

#### Definitions of Done
Scenario 1: Running a Query  
Given: The discord user calls the bot to run a query  
When: The bot verifies the query and runs it  
Then: The bot returns the results to the discord user or an error message explaining the error
