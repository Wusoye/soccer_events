import requests
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime

#Cherche tout les matchs du jour donné en param

date = '2021-12-15'
url = "https://apiclient.besoccerapps.com/scripts/api/api.php?key=b3fcd6725e03f4e5d588f6624cac5522&tz=Europe/Madrid&format=json&req=matchsday&date="+date

response = requests.request("GET", url)

#print(response.text)
matches = response.json().get('matches')
date = datetime.strptime(date, '%Y-%m-%d')
print(date)



matches_today = pd.DataFrame(columns = ['time', 'competition_name', 'local_team', 'visitor_team', 'matche_id'])
k = 0
for matche in matches:
    matche_id = matche.get('id')
    competition_name = matche.get('competition_name')
    league_id = matche.get('league_id')
    local_team = matche.get('local')
    visitor_team = matche.get('visitor')
    local_team_id = matche.get('team1')
    visitor_team_id = matche.get('team2')
    local_dteam_id = matche.get('dteam1')
    visitor_dteam_id = matche.get('dteam2')
    year = matche.get('year')
    dated = matche.get('date')
    time = matche.get('hour') + ':' + matche.get('minute')
    status = matche.get('status')
    winner = matche.get('winner')
    coef = matche.get('coef')
    matches_today.loc[k, 'time'] = time
    matches_today.loc[k, 'competition_name'] = competition_name
    matches_today.loc[k, 'local_team'] = local_team
    matches_today.loc[k, 'visitor_team'] = visitor_team
    matches_today.loc[k, 'matche_id'] = matche_id
    #print(time, ': ', competition_name, ': ', local_team, '-', visitor_team, '/', local_dteam_id, '-', visitor_dteam_id)
    #print(time, ': ', competition_name, ': ', local_team, '-', visitor_team, '/', matche_id)
    k=k+1
matches_today = matches_today.sort_values(by = 'time').reset_index()
matches_today

#Cherche id des teams d'un match et appelle la fonction avg_xG() qui rend un DATAFRAME

#rid_local = 17944                                
#rid_visitor = 2320  
rid_fixture = 4092

for matche in matches:
    matche_id = matche.get('id')
    if int(matche_id) == rid_fixture:
        rid_local = int(matche.get('dteam1'))
        rid_visitor = int(matche.get('dteam2'))
        local_team = matche.get('local')
        visitor_team = matche.get('visitor')


xGs_local = avg_xG(rid_local)
xGs_visitor = avg_xG(rid_visitor)

print(local_team,': ', float(xGs_local[3]), '/', float(xGs_local[2]), float(xGs_local[1]), float(xGs_local[0]))
print(visitor_team,': ', float(xGs_visitor[3]), '/', float(xGs_visitor[2]), float(xGs_visitor[1]), float(xGs_visitor[0]))

#print('local:', off_local, '-', def_local, 'visitor:', off_visitor, '-', def_visitor)

#Mise en place du DATFRAME pour UNE equipe avec les xG(s)

def avg_xG(rid_dteam):             
    url = "https://apiclient.besoccerapps.com/scripts/api/api.php?key=b3fcd6725e03f4e5d588f6624cac5522&tz=Europe/Madrid&format=json&req=matches_team&id="+str(rid_dteam)

    response = requests.request("GET", url)

    #print(response.text)
    competitions = response.json().get('matches')
    matches_by_team = pd.DataFrame(columns = ['datetime', 'year', 'matche_id', 'league_id', 'competition_name', 'team_id', 'team_name', 'goals_for', 'goals_against'])
    k = 0
    for competition in competitions:
        competition_id = competition.get('id')
        league_id = competition.get('league_id')
        competition_name = competition.get('name')
        year = competition.get('year')
        matches = competition.get('matches') #OBJET
        #print(competition_name, '-', len(matches))
        if matches != None and int(year) > 2020 and int(league_id) != 62807:
            for matche in matches:
                status = matche.get('status')
                if status == 1:
                    matche_id = matche.get('id')
                    t1_id = int(matche.get('t1_id'))
                    t2_id = int(matche.get('t2_id'))
                    t1_name = matche.get('t1_name')
                    t2_name = matche.get('t2_name')
                    shedule = matche.get('shedule')
                    r1 = int(matche.get('r1'))
                    r2 = int(matche.get('r2'))
                    
                    if datetime.strptime(dated, '%Y/%m/%d') > datetime.strptime(shedule, '%Y-%m-%d %H:%M:%S'):
                        if t1_id == rid_dteam:
                            matches_by_team.loc[k, 'datetime'] = shedule
                            matches_by_team.loc[k, 'year'] = year
                            matches_by_team.loc[k, 'matche_id'] = matche_id
                            matches_by_team.loc[k, 'league_id'] = league_id
                            matches_by_team.loc[k, 'competition_name'] = competition_name
                            matches_by_team.loc[k, 'team_id'] = t1_id
                            matches_by_team.loc[k, 'team_name'] = t1_name
                            matches_by_team.loc[k, 'goals_for'] = r1
                            matches_by_team.loc[k, 'goals_against'] = r2
                            if r1 > r2:
                                matches_by_team.loc[k, 'winner'] = 'w'
                            if r1 == r2:
                                matches_by_team.loc[k, 'winner'] = 'd'
                            if r1 < r2:
                                matches_by_team.loc[k, 'winner'] = 'l'


                        elif t2_id == rid_dteam:
                            matches_by_team.loc[k, 'datetime'] = shedule
                            matches_by_team.loc[k, 'year'] = year
                            matches_by_team.loc[k, 'matche_id'] = matche_id
                            matches_by_team.loc[k, 'league_id'] = league_id
                            matches_by_team.loc[k, 'competition_name'] = competition_name
                            matches_by_team.loc[k, 'team_id'] = t2_id
                            matches_by_team.loc[k, 'team_name'] = t2_name
                            matches_by_team.loc[k, 'goals_for'] = r2
                            matches_by_team.loc[k, 'goals_against'] = r1
                            if r1 < r2:
                                matches_by_team.loc[k, 'winner'] = 'w'
                            if r1 == r2:
                                matches_by_team.loc[k, 'winner'] = 'd'
                            if r1 > r2:
                                matches_by_team.loc[k, 'winner'] = 'l'

                        #print(shedule, '-', t1_id, ':', r1, 'vs', t2_id, ':', r2)
                        k = k +1
    print(k)
    matches_by_team = matches_by_team.sort_values(by = 'datetime').reset_index()
    count_matche = 1
    count_goals_for = 0
    count_goals_against = 0
    for k in range(len(matches_by_team)):
        goals_for = matches_by_team.loc[k, 'goals_for']
        goals_against = matches_by_team.loc[k, 'goals_against']
        count_goals_for = count_goals_for + goals_for
        count_goals_against = count_goals_against + goals_against
        offensive = count_goals_for / count_matche
        defensive = count_goals_against / count_matche
        matches_by_team.loc[k, 'offensive'] = offensive
        matches_by_team.loc[k, 'defensive'] = defensive
        if defensive > 0:
            expected_goals = offensive / defensive
            matches_by_team.loc[k, 'expected_goals'] = expected_goals
        else:
            matches_by_team.loc[k, 'expected_goals'] = offensive
    
        matches_by_team.loc[k, 'expected_goals_l3'] = xG_last_n_games(k, 3, matches_by_team)
        matches_by_team.loc[k, 'expected_goals_l5'] = xG_last_n_games(k, 5, matches_by_team)
        matches_by_team.loc[k, 'expected_goals_l7'] = xG_last_n_games(k, 7, matches_by_team)
        
        


        count_matche = count_matche + 1 

    #res_avg = round(matches_by_team.loc[5:,'expected_goals'].mean(), 2)
    #res_last = round(matches_by_team.loc[len(matches_by_team)-1,'expected_goals'], 2)
    
    #res_off = round(matches_by_team.loc[len(matches_by_team)-1:,'offensive'], 2)
    #res_def = round(matches_by_team.loc[len(matches_by_team)-1:,'defensive'], 2)
    
    expected_goals_l3 = round(matches_by_team.loc[:,'expected_goals_l3'].iloc[-1:], 2)
    expected_goals_l5 = round(matches_by_team.loc[:,'expected_goals_l5'].iloc[-1:], 2)
    expected_goals_l7 = round(matches_by_team.loc[:,'expected_goals_l7'].iloc[-1:], 2)
    
    expected_goals = round(matches_by_team.loc[:,'expected_goals'].iloc[-1:], 2)

    #print(matches_by_team)
    
    return [expected_goals_l3, expected_goals_l5, expected_goals_l7, expected_goals]

#Calcule le xG des n derniers matchs pour chaque ligne

def xG_last_n_games(k, n, matches_by_team):
        #LAST GAMES 3
        if k > n-2: 
            count_matche_l3 = 1
            count_goals_for_l3 = 0
            count_goals_against_l3 = 0
            matches_by_team_l3 = matches_by_team.loc[:k].iloc[-n:].reset_index()

            for k_l3 in range(len(matches_by_team_l3)):
                goals_for_l3 = matches_by_team_l3.loc[k_l3, 'goals_for']
                goals_against_l3 = matches_by_team_l3.loc[k_l3, 'goals_against']
                count_goals_for_l3 = count_goals_for_l3 + goals_for_l3
                count_goals_against_l3 = count_goals_against_l3 + goals_against_l3
                offensive_l3 = count_goals_for_l3 / count_matche_l3
                defensive_l3 = count_goals_against_l3 / count_matche_l3
                count_matche_l3 = count_matche_l3 + 1

            if defensive_l3 > 0:
                expected_goals_l3 = offensive_l3 / defensive_l3
            else:
                expected_goals_l3 = offensive_l3
            return expected_goals_l3