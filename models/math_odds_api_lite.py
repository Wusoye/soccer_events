import requests
import json
import pandas as pd
from datetime import datetime
import math
import numpy
from numpy import mean

def one_to_many_tab(tab):
    all1 = []
    allX = []
    all2 = []

    for un_tab in tab:
        if un_tab[-3] != 0 and un_tab[-2] != 0 and un_tab[-1] != 0:
            all1.append(un_tab[-3])
            allX.append(un_tab[-2])
            all2.append(un_tab[-1])
    
    return all1, allX, all2

# Collecte de tout les id dans mt_id des matchs en fonction de la date et des id de league rensiegner. 
lst_matchs = pd.DataFrame(columns = ['id','date_time','league', 'home','away'])
dates=['2021-08-26']
k = 0
mts_id = []
for une_date in dates:
    url_compet = "https://www.oddsmath.com/api/v1/events-by-day.json/?language=en&country_code=FR&timezone=Europe%2FParis&day="+str(une_date)+"&grouping_mode=0"
    reponse = requests.get(url_compet).json()
    
    #league_ids = ['1176']
    #league_ids = [1007,1083,1084,1245,1247,1281,1278,1122,1312,1219,1220,1315,1317,1176,1707]
    league_ids = [1007,1083,1084,1245,1247,1281,1278,1122,1312,1219,1220,1315,1317,1707,1176,1136,2016,1142,1369,3057,1329,1050,1063,1147,1332,1456]
    #league_ids = [1083,1245,1247,1281,1122,1219,1315]
    #league_ids = [1707]
    
    for league_id in league_ids:
        events = list(reponse.get('data'))    
        
        if str(league_id) in events:
            a = list(reponse.get('data').get(str(league_id)).get('events').keys())
            league = reponse.get('data').get(str(league_id)).get('label')
            for idmt in a:
                mts_id.append(idmt)
                hometeam = reponse.get('data').get(str(league_id)).get('events').get(str(idmt)).get('hometeam_name')
                awayteam = reponse.get('data').get(str(league_id)).get('events').get(str(idmt)).get('awayteam_name')
                my_datetime = reponse.get('data').get(str(league_id)).get('events').get(str(idmt)).get('time')
                lst_matchs.loc[k , 'id'] = idmt
                lst_matchs.loc[k , 'date_time'] = my_datetime
                lst_matchs.loc[k , 'league'] = league
                lst_matchs.loc[k , 'home'] = hometeam
                lst_matchs.loc[k , 'away'] = awayteam
                
                if reponse.get('data').get(str(league_id)).get('events').get(str(idmt)).get('livescore'):
                    livescore = reponse.get('data').get(str(league_id)).get('events').get(str(idmt)).get('livescore')
                    status_code = livescore.get('status_code')
                    if status_code == 250:
                        score = livescore.get('value')
                        home_goal = score.split('-')[0]
                        away_goal = score.split('-')[1]

                        if home_goal > away_goal:
                            vainqueur = 0
                        elif home_goal < away_goal:
                            vainqueur = 2
                        else:
                            vainqueur = 1


                        lst_matchs.loc[k , 'score'] = score
                        lst_matchs.loc[k , 'vainqueur'] = vainqueur
                    
                #print(idmt, ':', hometeam, 'vs', awayteam)
                
                k += 1
                
all_match = pd.DataFrame(columns = ['id', 'date_time', 'league', 'hometeam', 'awayteam', 'score', 'vainqueur'])
#id_= 3530816                                                                                                                                                                                                                                                                                                                                                                                                                            
#mts_id = [str(id_)]
time_odd = pd.DataFrame()
k = 0

for mt_id in mts_id:
    url_mt = "https://www.oddsmath.com/api/v1/live-odds.json/?event_id=" + str(mt_id) + "&cat_id=0&include_exchanges=1&language=en&country_code=FR"
    reponse_mt = requests.get(url_mt).json()
    data = reponse_mt.get('data')
    event = reponse_mt.get('event')
    #print(event.get('time'))
    #date = event.get('time').split(' ')[0]
    hometeam = reponse_mt.get('event').get('hometeam').get('name')
    awayteam = reponse_mt.get('event').get('awayteam').get('name')
    
    all_match.loc[k, 'id'] = mt_id
    all_match.loc[k, 'date_time'] = lst_matchs.loc[k , 'date_time']
    all_match.loc[k, 'league'] = lst_matchs.loc[k , 'league']
    all_match.loc[k, 'hometeam'] = hometeam
    all_match.loc[k, 'awayteam'] = awayteam
    #all_match.loc[k, 'score'] = lst_matchs.loc[k , 'score']
    #all_match.loc[k, 'vainqueur'] = lst_matchs.loc[k , 'vainqueur']
    
    if reponse_mt.get('data'):
        list_book = list(reponse_mt.get('data').keys())

        res = []
        drop = []
        op = []
        history_book =[]
        
        for un_book in list_book:

                    if str(un_book) != 'Betfair':
                        le_book = reponse_mt.get('data').get(un_book)
                        history = le_book.get('history')

                        drop1 = history[0].get('1')
                        dropX = history[0].get('X')
                        drop2 = history[0].get('2')
                        op1 = history[-1].get('1')
                        opX = history[-1].get('X')
                        op2 = history[-1].get('2')
                        res1 = round((drop1 - op1)/(op1 - 1)*100, 2)
                        resX = round((dropX - opX)/(opX - 1)*100, 2)
                        res2 = round((drop2 - op2)/(op2 - 1)*100, 2)
                        drop.append([drop1,dropX,drop2])
                        op.append([op1,opX,op2])
                        res.append([res1,resX,res2])
                        
                        history_odd_1 = []
                        history_odd_X = []
                        history_odd_2 = []
                        
                        i=0                    
                    
                        for one_updated in history:
                            #date = datetime.strptime(one_updated.get('updated'), '%Y-%m-%d %H:%M:%S')
                            date = one_updated.get('updated')
                            cote_1 = one_updated.get('1')
                            cote_X = one_updated.get('X')
                            cote_2 = one_updated.get('2')
                            
                            history_odd_1.append(cote_1)
                            history_odd_X.append(cote_X)
                            history_odd_2.append(cote_2)
                            
                            time_odd.loc[i,'date'] = date
                            time_odd.loc[i,'cote_1'] = float(cote_1)
                            time_odd.loc[i,'cote_X'] = float(cote_X)
                            time_odd.loc[i,'cote_2'] = float(cote_2)
                            i=i+1

        dropping_1, dropping_X, dropping_2 = one_to_many_tab(res)
        opening_1, opening_X, opening_2 = one_to_many_tab(op)
        
        odds_dropping_mean_1 = mean(dropping_1)
        odds_dropping_mean_X = mean(dropping_X)
        odds_dropping_mean_2 = mean(dropping_2)
        
        all_match.loc[k, 'odds_dropping_mean_1'] = odds_dropping_mean_1
        all_match.loc[k, 'odds_dropping_mean_X'] = odds_dropping_mean_X
        all_match.loc[k, 'odds_dropping_mean_2'] = odds_dropping_mean_2
        

    
    k += 1
    
all_match = all_match.sort_values(by = 'date_time')
all_match.to_csv('view_of_drop_today.csv', index=False)


