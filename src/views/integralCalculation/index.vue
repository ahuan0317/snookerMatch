<template>
  <div class="container">
    <!-- 标题、图标区域 -->
    <h1 class="title">桌球积分赛</h1>
    <!-- 操作 -->
    <el-row>
      <el-col class="operation">
        <el-row>
          <!-- 添加成员 -->
          <el-col :span="3">
            <el-select v-model="groupValue" placeholder="请选择小组" clearable>
              <el-option
                v-for="(item, key) in groupData"
                :key="key"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="3" style="margin-right: 5px;">
            <el-input placeholder="请输入队员名称" v-model="teamMemberValue" clearable></el-input>
          </el-col>
          <el-col :span="3"><el-button type="primary" @click="addTeamMember">添加队员</el-button></el-col>
          <!-- 操作成员分数 -->
          <el-col :span="3" style="margin-right: 5px;">
            <el-select v-model="personValue" placeholder="请选择队员" @change="changeTeamMember" @focus="focusTeamMember" clearable>
              <el-option
                v-for="(item, key) in personData"
                :key="key"
                :label="`${item.groupValue}--${item.label}`"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="1" style="margin-right: 5px;">
            <h3 class="current-number-class">分数：</h3>
          </el-col>
          <el-col :span="3" style="margin-right: 5px;">
            <el-input-number
              v-model="currentScore"
              @change="changeTeamMemberNumber"
              :min="0"
              :disabled="!this.currentTeamMember ? true : false"
            ></el-input-number>
          </el-col>
          <el-col :span="1" style="margin-right: 5px;">
            <h3 class="current-number-class">场次：</h3>
          </el-col>
          <el-col :span="3" style="margin-right: 5px;">
            <el-input-number
              v-model="currentSessions"
              @change="changeTeamMemberSessions"
              :min="0"
              :disabled="!this.currentTeamMember ? true : false"
            ></el-input-number>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-row>
       <el-col :span="24" class="data-display">
        <el-table
          :data="matchPersonData"
          style="width: 100%"
          stripe
          border
        >
          <el-table-column prop="teamMember" label="队员名称" align="center" />
          <el-table-column prop="teamName" label="所属小组" align="center" />
          <el-table-column prop="teamMemberSessions" label="场次" align="center" />
          <el-table-column prop="teamMemberPoints" label="积分" align="center" />
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button type="danger" size="small" @click="deleteSelectTeamMember(scope.row)">删除队员</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { setItem, getItem } from '../../../utils/storage'
export default {
  name: 'IntegralCalculation',
  data() {
    return {
      // 成员数据
      teamMemberValue: '',
      // 所有小组数据
      groupValue: '',
      groupData: [
        { label: '小组1', value: '小组1' },
        { label: '小组2', value: '小组2' },
        { label: '小组3', value: '小组3' },
        { label: '小组4', value: '小组4' },
        { label: '小组5', value: '小组5' },
        { label: '小组6', value: '小组6' },
        { label: '小组7', value: '小组7' },
        { label: '小组8', value: '小组8' },
        { label: '小组9', value: '小组9' },
        { label: '小组10', value: '小组10' },
        { label: '小组11', value: '小组11' },
        { label: '小组12', value: '小组12' },
      ],
      // 所有队员数据
      personValue: '',
      personData: [],
      // 积分榜数据
      matchPersonData: [],
      // 当前分数
      currentScore: 0,
      // 当前选择的队员
      currentTeamMember: null,
      // 当前场地
      currentSessions: 0
    }
  },
  mounted() {
    this.getAllTeamMember()
  },
  methods: {
    // 唯一值
    uuid(){
      const tempUrl = URL.createObjectURL(new Blob());
      const uuid = tempUrl.toString();
      URL.revokeObjectURL(tempUrl);  // 释放这个url
      return uuid.substring(uuid.lastIndexOf("/") + 1)
    },
    // 获取所有成员数据
    getAllTeamMember() {
      const temp = getItem('personData')
      this.personData = temp && temp.sort((a, b) => a.groupValue.split('组')[1] - b.groupValue.split('组')[1]) || []

      // 展示所有比赛队员数据
      let temp2 = JSON.parse(JSON.stringify(this.personData))
      this.matchPersonData = temp2 && temp2.map(item => {
        return {
          teamMember: item.label,
          teamName: item.groupValue,
          teamMemberSessions: item.currentSessions,
          teamMemberPoints: item.currentScore
        }
      }).sort((a, b) => b.teamMemberPoints - a.teamMemberPoints)
    },
    // 添加成员
    addTeamMember() {
      // 校验
      if (!(this.teamMemberValue && this.groupValue)) {
        this.$message.warning('请完善队员数据')
        return
      }

      // 判断所有队员数据是否为空
      if(!(this.personData && this.personData.length > 0)) {
        this.personData.push({
          label: this.teamMemberValue,
          value: `1001_${this.uuid()}`,
          groupValue: this.groupValue,
          currentSessions: 0,
          currentScore: 0,
        })
        setItem('personData', this.personData)
        this.getAllTeamMember()
      } else {
        // 获取数值最高的id, 后面用作数据递增
        this.personData = getItem('personData').sort((a, b) => parseInt(b.value.split('_')[0]) - parseInt(a.value.split('_')[0]))

        // 判断该队伍中是否有该成员
        const isTeamMember = this.personData.some(item => item.label === this.teamMemberValue && item.groupValue === this.groupValue)
        if (isTeamMember) {
          this.$message.warning('该成员已存在这个小组, 请勿重新添加')
          return
        }

        // 没有则添加该成员
        let newValue = parseInt(this.personData[0].value.split('_')[0])
        this.personData.push({
          label: this.teamMemberValue,
          value: `${++newValue}_${this.uuid()}`,
          groupValue: this.groupValue,
          currentSessions: 0,
          currentScore: 0,
        })

        // 更新本地数据
        setItem('personData', this.personData)
        this.getAllTeamMember()
      }
      // teamMember
      // teamName
      // teamMemberSessions
      // teamMemberPoints
    },
    // 聚焦成员下拉触发
    focusTeamMember() {
      // 聚焦成员下拉时, 重新拉取最新数据, 以免旧数据
      this.getAllTeamMember()
    },
    // 改变成员下拉触发
    changeTeamMember(value) {
      const currentTeamMember = this.personData && this.personData.filter(item => item.value === value)[0]
      this.currentScore = currentTeamMember && currentTeamMember.currentScore || 0
      this.currentSessions = currentTeamMember && currentTeamMember.currentSessions || 0
      this.currentTeamMember = currentTeamMember || null
    },
    // 改变分数加减触发
    changeTeamMemberNumber(item) {
      // 修改数据
      this.currentTeamMember.currentScore = item
      const currentIndex = this.personData.findIndex(item => item.value === this.currentTeamMember.value)
      this.personData[currentIndex] = this.currentTeamMember

      // 同步数据
      setItem('personData', this.personData)
      this.getAllTeamMember()
    },
    // 改变场地加减触发
    changeTeamMemberSessions(item) {
      // 修改数据
      this.currentTeamMember.currentSessions = item
      const currentIndex = this.personData.findIndex(item => item.value === this.currentTeamMember.value)
      this.personData[currentIndex] = this.currentTeamMember

      // 同步数据
      setItem('personData', this.personData)
      this.getAllTeamMember()
    },
    // 删除选中的队员
    deleteSelectTeamMember(row) {
      // 删除数据
      const newData = this.personData.filter(item => !(item.label === row.teamMember && item.groupValue === row.teamName))
      this.personData = newData

      // 同步数据
      setItem('personData', this.personData)
      this.getAllTeamMember()
    }
  }
}
</script>

<style lang="scss">
</style>

<style lang="scss" scoped>
  .container {
    max-width: 100%;
    padding: 20px 50px 50px;
    background-image: url('../../assets/img/bg.jpg');
    background-position: center center;
    height: 100vh;
    .title {
      color: white;
      text-align: center;
      font-size: 40px;
      margin: 0 0 30px;
      box-shadow: 0 2px 12px 0 rgba(196, 196, 196, 0.692);
      padding: 30px;
      border-radius: 10px;
    }
    .operation {
      margin-bottom: 30px;
    }
    .data-display .el-table {
      border-radius: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.692);
    }
    .current-number-class {
      margin: 0;
      padding: 0;
      line-height: 40px;
      font-size: 23px;
      color: white;
    }
  }
</style>
