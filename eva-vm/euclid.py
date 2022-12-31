def gcd(a, b):
    if (b == 0):
        return a
    print('a', a, 'b', b)
    return gcd(b, a%b)


# print(gcd(1781,163))

def mod(a, b):
    if (a < b): 
        return a
    return mod(a - b, b)    

# print(mod(10, 6))

def fact(a):
    if (a == 1):
        return a
    return a * fact(a-1)
    
memo = {}

def fact_memoized(a):
    if (a == 1):
        return a
    if a not in memo:
        memo[a] = a * fact(a-1)
    return memo[a]



import time
 
# record start time
start = time.time()
 
# define a sample code segment
fact(555)

 
# record end time
end = time.time()
 
# print the difference between start
# and end time in milli. secs
print("The time of execution of above program is :",
      (end-start) * 10**3, "ms")

fact_memoized(556)
start = time.time()
 
# define a sample code segment
fact_memoized(555)

 
# record end time
end = time.time()
 
# print the difference between start
# and end time in milli. secs
print("The time of execution of above program is :",
      (end-start) * 10**3, "ms")