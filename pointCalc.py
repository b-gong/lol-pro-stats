import json

def loadInfo(fileName):
    f = open(fileName, "r")
    statFile = f.readlines()
    rawJSON = ""
    for x in statFile:
        rawJSON += x

    return json.loads(rawJSON)

def searchPlayer(teamIn, nameIn, source):
    for team in source:
        if team == teamIn:
            for name in stats[team]:
                if name == nameIn:
                    return stats[team][name]

def pointTally(stats):
    value = 0
    value += float(stats["kills"])*3
    value += float(stats["deaths"])*-1
    value += float(stats["assists"])*2
    value += float(stats["cs"])*0.01
    return value

def evaluate(source):
    allPlayerValues = {}
    for team in source:
        for name in source[team]:
            playerInfo = searchPlayer(team, name, source)
            print (name)
            value = pointTally(playerInfo)
            try:
                allPlayerValues[team][name] = value
            except:
                allPlayerValues[team] = {}
                allPlayerValues[team][name] = value
    return allPlayerValues

stats = loadInfo("./playerStats.json")

result = evaluate(stats)

jsonResult = {}

for team in result:
    for name in result[team]:
        jsonResult[team + " " + name] = result[team][name]

jsonResult = {k: v for k, v in sorted(jsonResult.items(), key=lambda item: item[1], reverse=True)}

print(json.dumps(jsonResult))
