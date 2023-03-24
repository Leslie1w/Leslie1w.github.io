# -*- coding = utf-8 -*-
# @Time : 2022/9/24 18:30
# @Author : TaoJay
# @File : xiaoheizi.py
# @Software : PyCharm
import time
import cv2
import os
import shutil
from PIL import Image
import curses




def video2image(video_path):
    if not os.path.exists(video_path):
        raise ValueError("Don't find this video")

    # 保存图片的路径
    image_save_path = os.path.join(os.path.dirname(video_path), os.path.splitext(os.path.basename(video_path))[0])
    if not os.path.exists(image_save_path):
        os.makedirs(image_save_path)
    else:
        print('path of {} already exist and rebuild'.format(image_save_path))

    # 保存图片的帧率间隔，每隔多少帧进行一次图片保存
    count = 1

    # 获取当前终端的宽度和长度，为之后的显示做图像resize
    width = os.get_terminal_size().columns
    height = os.get_terminal_size().lines
    print("终端大小:宽{},高{}".format(width, height))

    # 开始读视频
    videoCapture = cv2.VideoCapture(video_path)
    i, j = 0, 0
    while True:
        success, frame = videoCapture.read()
        i += 1
        if (i % count == 0) and success:
            # 保存图片
            j += 1
            # 找一个比较小的比例
            rate_x = (width - 1) / frame.shape[1]
            rate_y = (height - 1) / frame.shape[0] * 2
            rate = min(rate_x, rate_y)
            frame = cv2.resize(frame, (0, 0), fx=rate, fy=rate, interpolation=cv2.INTER_NEAREST)
            savedname = os.path.splitext(os.path.basename(video_path))[0] + '_' + '%04d' % j + '.jpg'
            cv2.imwrite(os.path.join(image_save_path, savedname), frame)
        elif success:
            # 不保存的帧
            pass
        else:
            print('抽帧完成')
            break


# 把抽帧得到的图片全部转化为字符画
def pic2str_V1(video_path):
    '''
    第一个版本的图片转换为字符串的代码
    像素点根据需要表示的字符进行等比例的划分
    之后进行字符串的一个一个对像素点的赋值
    '''
    # table = ("$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'. ")
    # table = ('#8XOHLTI)i=+;:,. ')  # 对于灰度图像效果不错
    table = ('#8Oo=:. ')  # 对于灰度图像效果不错

    # 拿到保存图片的路径
    pics_path = video_path.split('.')[0]

    # 创建保存字符画的路径
    str_pic_path = video_path.split('.')[0] + '_str'
    if not os.path.exists(str_pic_path):
        os.makedirs(str_pic_path)
        # print('path of %s is build' % (savedpath))
    else:
        shutil.rmtree(str_pic_path)
        os.makedirs(str_pic_path)
        # print('path of %s already exist and rebuild' % (savedpath))

    pics = os.listdir(pics_path)  # 获取文件夹内部的所有图片的basename
    for pic in pics:
        pic_path = os.path.join(pics_path, pic)
        str_pic_name = os.path.join(str_pic_path, os.path.splitext(pic)[0] + '.txt')

        # 转换
        img = Image.open(pic_path)
        # img = img.resize((300, 200))  # 转换图像大小 可以调整字符串图像的长和宽

        if img.mode != "L":  # 如果不是灰度图像，转换为灰度图像
            im = img.convert("L")
        x = img.size[0]
        y = img.size[1]

        f = open(str_pic_name, 'w+')  # 目标文本文件

        for i in range(1, y, 2):  # 因为显示字符的长款本来就是有点不太一样
            line = ('')
            for j in range(x):
                line += table[int((float(im.getpixel((j, i))) / 256.0) * len(table))]
            line += ("\n")
            f.write(line)
        f.close()

    print('字符画完成')
    return str_pic_path


# 把抽帧得到的图片全部转化为字符画
def pic2str_V2(video_path):
    '''
    第二个版本的图片转换为字符串的代码
    像素点根据分布进行划分，需要使用到pic2dict
    之后进行字符串的一个一个对像素点的赋值
    '''
    # table = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
    # table = '#8XOHLTI)i=+;:,. '  # 对于灰度图像效果不错
    table = '@8Oo=:. '  # 对于灰度图像效果不错
    # table = '#=:. '  # 对于灰度图像效果不错

    # 拿到保存图片的路径
    pics_path = video_path.split('.')[0]

    # 创建保存字符画的路径
    str_pic_path = video_path.split('.')[0] + '_str'
    if not os.path.exists(str_pic_path):
        os.makedirs(str_pic_path)
        # print('path of %s is build' % (savedpath))
    else:
        shutil.rmtree(str_pic_path)
        os.makedirs(str_pic_path)
        # print('path of %s already exist and rebuild' % (savedpath))

    # 图像转换之后压入栈中
    pics = os.listdir(pics_path)  # 获取文件夹内部的所有图片的basename
    pic_list = []
    str_pic_name_list = []
    for pic in pics:
        pic_path = os.path.join(pics_path, pic)
        str_pic_name = os.path.join(str_pic_path, os.path.splitext(pic)[0] + '.txt')
        str_pic_name_list.append(str_pic_name)
        # 转换
        img = Image.open(pic_path)
        if img.mode != "L":  # 如果不是灰度图像，转换为灰度图像
            img = img.convert("L")
        pic_list.append(img)
    # 栈内所有的图片进行函数运行
    # 将图片进行所有像素点的统计根据统计的像素点，得到像素点与字符的对应关系（字典）
    dic_pixel = pic2dict(pic_list, table=table, ifreversed=True)

    # 写入字符串存入文件
    for index in range(len(pic_list)):
        x = pic_list[index].size[0]
        y = pic_list[index].size[1]
        f = open(str_pic_name_list[index], 'w+')  # 目标文本文件
        for i in range(1, y, 2):  # 因为显示字符的长款本来就是有点不太一样
            line = ('')
            for j in range(x):
                line += dic_pixel[pic_list[index].getpixel((j, i))]
            line += ("\n")
            f.write(line)
        f.close()

    print('字符画完成')
    return str_pic_path


# 图片统计像素点，得到像素点对应字典
def pic2dict(pic_list, table='#8Oo=:. ', ifreversed=False):
    '''
    ifreversed = True的时候反色
    反色状态下黑色的像素点对应比较复杂的字符
             白色的像素点对应比较简单的字符
    ifreversed = False的时候不反色
    反色状态下黑色的像素点对应比较简单的字符
             白色的像素点对应比较复杂的字符
    '''
    if ifreversed:
        pass
    else:
        table = table[::-1]
    dic_pixel = {}
    for i in range(256):
        dic_pixel[i] = 0
    x = pic_list[0].size[0]
    y = pic_list[0].size[1]
    count = 0
    for pic in pic_list:
        for i in range(1, y, 2):  # 因为显示字符的长款本来就是有点不太一样
            for j in range(x):
                dic_pixel[pic.getpixel((j, i))] += 1
                count += 1

    all_pixel_data = len(pic_list) * x * y / 2
    start_pixel = 255
    for i in range(len(table)):
        sum_pixel = 0
        if_just_one = True
        for pixel in range(start_pixel, -1, -1):
            sum_pixel += dic_pixel[pixel]
            if sum_pixel >= all_pixel_data / (len(table) - 1):
                if if_just_one:
                    dic_pixel[pixel] = table[i]
                    start_pixel = pixel - 1
                else:
                    if all_pixel_data / (len(table) - 1) - sum_pixel + dic_pixel[pixel] > sum_pixel - all_pixel_data / (
                            len(table) - 1):
                        dic_pixel[pixel] = table[i]
                        start_pixel = pixel - 1
                    else:
                        start_pixel = pixel
                break
            else:
                if_just_one = False
                dic_pixel[pixel] = table[i]
        if pixel == 0:
            break
    for i in dic_pixel.keys():
        if isinstance(dic_pixel[i], str):
            continue
        else:
            dic_pixel[i] = table[-1]
    return dic_pixel


# 第三步 把字符画按照顺序动态打印 实现动画效果
def play_str(play_dir):
    strs = os.listdir(play_dir)
    for str_txt in strs:
        real_dir = play_dir + '\\' + str_txt
        with open(real_dir, 'r') as f:
            ret = f.read()
        print(ret)
        time.sleep(0.03)
        # os.system("cls")
        # subprocess.run('cls', shell=True)


# 主函数V1
# 进行清屏然后打印
# 但是出现比较那一解决的空白显示在终端的情况（出现）
def main_V1():
    # 修改成你的视频路径 
    video_path = r'C:\Users\ZZQ\Desktop\2.mp4'  # 修改你要生成字符画的视频路径
    video2image(video_path)
    play_dir = pic2str_V1(video_path)
    input('转换完成 按任意键开始播放')
    play_str(play_dir)


# 主函数V2
# 使用curses库
# 不会出现清屏的情况，是根据坐标进行刷新的
def main_V2():
    # 修改成你的视频路径
    video_path = r'C:\Users\TAOjay\Desktop\202209241835.mp4'  
    video2image(video_path)
    play_dir = pic2str_V2(video_path)
    input('转换完成 按任意键开始播放')

    stdscr = curses.initscr()
    curses.noecho()  # 不输出- -
    curses.cbreak()  # 立刻读取:暂不清楚- -
    stdscr.keypad(1)  # 开启keypad
    stdscr.box()
    stdscr.nodelay(True)

    width = os.get_terminal_size().columns
    height = os.get_terminal_size().lines
    c_y = height // 2 - 1
    c_x = width // 2 - 10
    stdscr.addstr(c_y, c_x, 'Now press C to start...', curses.A_REVERSE)
    stdscr.addstr(c_y + 1, c_x, 'After movie start, D to end.', curses.A_REVERSE)
    while True:
        c = stdscr.getch()
        if c == ord('c') or c == ord('C'):
            break

    strs = os.listdir(play_dir)
    for str_txt in strs:
        real_dir = play_dir + '\\' + str_txt
        with open(real_dir, 'r') as f:
            ret = f.read()
        stdscr.addstr(0, 0, ret)
        stdscr.move(0, 0)
        stdscr.refresh()
        time.sleep(0.005)
        c = stdscr.getch()
        if c == ord('d') or c == ord('D'):
            break

    curses.endwin()


if __name__ == '__main__':
    main_V2()

