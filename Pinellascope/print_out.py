with open("list_of_facts.txt", "r+", encoding="UTF-8") as file:
    facts = [i.split(';') for i in file.readlines()]

for fact in facts[0]:
    print(fact)